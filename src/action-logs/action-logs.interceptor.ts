import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, isValidObjectId } from 'mongoose';
import * as jwt from 'jsonwebtoken';
import { isDeepStrictEqual } from 'util';
import { defer, Observable } from 'rxjs';
import { catchError, mergeMap, tap } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { JWT_SECRET } from 'src/auth/jwt.constants';
import { ActionLogChange } from './action-log.schema';
import { ActionLogsService } from './action-logs.service';

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

// First URL segment -> mongoose model name. Modules not listed here (otp, web,
// uploads, action-logs, patient self-service auth) are never logged.
const MODEL_BY_MODULE: Record<string, string | null> = {
  appointments: 'Appointment',
  invoice: 'Invoice',
  patients: 'Patient',
  users: 'User',
  doctors: 'Doctor',
  products: 'Product',
  blogs: 'Blog',
  banners: 'Banner',
  gallery: 'Gallery',
  'gallery-images': 'GalleryImage',
  'contact-details': 'ContactDetail',
  'app-config': 'AppConfig',
  auth: null,
};

const NOUN_BY_MODULE: Record<string, string> = {
  appointments: 'appointment',
  invoice: 'invoice',
  patients: 'patient',
  users: 'user',
  doctors: 'doctor',
  products: 'service',
  blogs: 'blog',
  banners: 'banner',
  gallery: 'gallery',
  'gallery-images': 'gallery image',
  'contact-details': 'contact details',
  'app-config': 'app config',
};

const IGNORED_FIELDS = new Set([
  '_id',
  '__v',
  'created_at',
  'createdAt',
  'updated_at',
  'updatedAt',
]);
const REDACTED_FIELDS = new Set([
  'password',
  'otp',
  'token',
  'accessToken',
  'authorization',
]);
const LABEL_FIELDS = [
  'invoice_number',
  'appointment_number',
  'title',
  'name',
  'email',
  'patient_number',
];
const MAX_CHANGES = 60;
const MAX_VALUE_LENGTH = 2000;

interface Actor {
  id: string;
  name: string;
  email: string;
  role: string;
}

@Injectable()
export class ActionLogsInterceptor implements NestInterceptor {
  constructor(
    private readonly actionLogs: ActionLogsService,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() !== 'http') return next.handle();

    const req = context.switchToHttp().getRequest();
    if (!MUTATING_METHODS.has(req.method)) return next.handle();

    const path: string = (req.originalUrl || req.url || '').split('?')[0];
    const segments = path.split('/').filter(Boolean);
    const moduleName = segments[0];
    if (!moduleName || !(moduleName in MODEL_BY_MODULE)) return next.handle();

    const isLogin = moduleName === 'auth' && segments[1] === 'login' && segments.length === 2;
    if (moduleName === 'auth' && !isLogin) return next.handle();

    const modelName = MODEL_BY_MODULE[moduleName];
    const paramId: string | undefined = req.params?.id;

    return defer(() => this.snapshot(modelName, paramId)).pipe(
      mergeMap((before) =>
        next.handle().pipe(
          tap((response) => {
            void this.logSuccess(req, {
              moduleName,
              path,
              isLogin,
              modelName,
              paramId,
              before,
              response,
            });
          }),
          catchError((err) => {
            if (isLogin) void this.logFailedLogin(req, path, err);
            return throwError(() => err);
          }),
        ),
      ),
    );
  }

  private async snapshot(modelName: string | null, id?: string) {
    if (!modelName || !id || !isValidObjectId(id)) return null;
    try {
      const model = this.connection.models[modelName];
      return model ? await model.findById(id).lean().exec() : null;
    } catch {
      return null;
    }
  }

  private async logSuccess(req: any, ctx: any) {
    try {
      const { moduleName, path, isLogin, modelName, paramId, before, response } = ctx;

      if (isLogin) {
        const actor = this.actorFromToken(response?.accessToken);
        if (!actor) return;
        return this.actionLogs.record({
          ...this.actorFields(actor),
          module: 'auth',
          action: 'LOGIN',
          method: req.method,
          path,
          summary: `${actor.name} logged in`,
          status_code: 200,
          ...this.requestMeta(req),
        });
      }

      const actor = this.resolveActor(req);
      if (!actor) return; // unauthenticated: not a staff/doctor action

      const method: string = req.method;
      const entityId: string | undefined =
        paramId || (response && response._id ? String(response._id) : undefined);

      const action =
        method === 'DELETE'
          ? 'DELETE'
          : method === 'PUT' || method === 'PATCH' || paramId
            ? 'UPDATE'
            : 'CREATE';

      const after =
        action === 'DELETE' ? null : await this.snapshot(modelName, entityId);

      let changes: ActionLogChange[];
      if (action === 'UPDATE' && before && after) {
        changes = this.diff(before, after);
        if (!changes.length) return; // nothing actually changed
      } else if (action === 'DELETE') {
        changes = this.flatten(before, 'old');
      } else if (action === 'CREATE') {
        changes = this.flatten(after || response, 'new');
      } else {
        changes = this.flatten(req.body, 'new');
      }

      const doc = after || before || (response && typeof response === 'object' ? response : null);
      const label = this.labelFor(doc);
      const noun = NOUN_BY_MODULE[moduleName] || moduleName;
      const verb = { CREATE: 'created', UPDATE: 'updated', DELETE: 'deleted' }[action];

      await this.actionLogs.record({
        ...this.actorFields(actor),
        module: moduleName,
        action,
        method,
        path,
        entity_id: entityId,
        entity_label: label,
        summary: `${actor.name} ${verb} ${noun}${label ? ' ' + label : ''}`,
        changes: changes.slice(0, MAX_CHANGES),
        status_code: req.res?.statusCode,
        ...this.requestMeta(req),
      });
    } catch {
      // never let logging affect the request
    }
  }

  private async logFailedLogin(req: any, path: string, err: any) {
    try {
      const email = req.body?.email ? String(req.body.email) : 'unknown';
      await this.actionLogs.record({
        user_email: email,
        user_name: email,
        module: 'auth',
        action: 'LOGIN_FAILED',
        method: req.method,
        path,
        summary: `Failed login attempt for ${email}`,
        status_code: typeof err?.getStatus === 'function' ? err.getStatus() : 401,
        ...this.requestMeta(req),
      });
    } catch {
      // ignore
    }
  }

  private resolveActor(req: any): Actor | null {
    if (req.user) {
      return this.toActor({
        sub: req.user.userId,
        first_name: req.user.first_name,
        last_name: req.user.last_name,
        email: req.user.email,
        role: req.user.role,
      });
    }
    const header: string = req.headers?.authorization || '';
    if (!header.startsWith('Bearer ')) return null;
    return this.actorFromToken(header.slice(7));
  }

  private actorFromToken(token?: string): Actor | null {
    if (!token) return null;
    try {
      return this.toActor(jwt.verify(token, JWT_SECRET) as any);
    } catch {
      return null;
    }
  }

  private toActor(p: any): Actor {
    const name = [p.first_name, p.last_name].filter(Boolean).join(' ').trim();
    return {
      id: p.sub ? String(p.sub) : '',
      name: name || p.email || 'Unknown user',
      email: p.email || '',
      role: p.role || '',
    };
  }

  private actorFields(a: Actor) {
    return {
      user_id: a.id,
      user_name: a.name,
      user_email: a.email,
      user_role: a.role,
    };
  }

  private requestMeta(req: any) {
    const fwd = req.headers?.['x-forwarded-for'];
    return {
      ip: (typeof fwd === 'string' ? fwd.split(',')[0].trim() : req.ip) || '',
      user_agent: String(req.headers?.['user-agent'] || '').slice(0, 300),
    };
  }

  private labelFor(doc: any): string {
    if (!doc) return '';
    for (const f of LABEL_FIELDS) {
      if (doc[f]) return String(doc[f]);
    }
    const full = [doc.first_name, doc.last_name].filter(Boolean).join(' ').trim();
    return full;
  }

  private clean(value: any): any {
    const json = JSON.parse(JSON.stringify(value ?? null));
    const text = JSON.stringify(json);
    if (text && text.length > MAX_VALUE_LENGTH) {
      return `[truncated ${text.length} chars]`;
    }
    return json;
  }

  private mask(field: string, value: any) {
    return REDACTED_FIELDS.has(field) && value != null ? '***' : this.clean(value);
  }

  private diff(before: any, after: any): ActionLogChange[] {
    const out: ActionLogChange[] = [];
    const fields = new Set([...Object.keys(before), ...Object.keys(after)]);
    for (const field of fields) {
      if (IGNORED_FIELDS.has(field)) continue;
      const a = JSON.parse(JSON.stringify(before[field] ?? null));
      const b = JSON.parse(JSON.stringify(after[field] ?? null));
      if (isDeepStrictEqual(a, b)) continue;
      out.push({ field, old: this.mask(field, a), new: this.mask(field, b) });
    }
    return out;
  }

  private flatten(doc: any, side: 'old' | 'new'): ActionLogChange[] {
    if (!doc || typeof doc !== 'object') return [];
    const out: ActionLogChange[] = [];
    for (const [field, value] of Object.entries(doc)) {
      if (IGNORED_FIELDS.has(field) || value === undefined) continue;
      const v = this.mask(field, value);
      out.push(side === 'old' ? { field, old: v, new: null } : { field, old: null, new: v });
    }
    return out;
  }
}
