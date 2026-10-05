import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ActionLog, ActionLogDocument } from './action-log.schema';

@Injectable()
export class ActionLogsService {
  private readonly logger = new Logger(ActionLogsService.name);

  constructor(
    @InjectModel(ActionLog.name)
    private readonly actionLogModel: Model<ActionLogDocument>,
  ) {}

  // Logging must never break the request that triggered it.
  async record(entry: Partial<ActionLog>): Promise<void> {
    try {
      await this.actionLogModel.create(entry);
    } catch (err) {
      this.logger.error(`Failed to write action log: ${err?.message}`);
    }
  }

  async findAll(params: Record<string, any>) {
    const size = Math.min(parseInt(params.size) || 10, 100);
    const page = parseInt(params.page) || 0;

    const query: Record<string, any> = {};
    if (params.module) query.module = params.module;
    if (params.action) query.action = params.action;
    if (params.role) query.user_role = params.role;
    if (params.user) query.user_id = params.user;

    if (params.q) {
      const regex = new RegExp(
        String(params.q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
        'i',
      );
      query.$or = [
        { user_name: regex },
        { user_email: regex },
        { entity_label: regex },
        { summary: regex },
      ];
    }

    const range: Record<string, Date> = {};
    if (params.from) {
      const from = new Date(params.from);
      if (!isNaN(from.getTime())) range.$gte = from;
    }
    if (params.to) {
      const to = new Date(params.to);
      if (!isNaN(to.getTime())) {
        to.setHours(23, 59, 59, 999);
        range.$lte = to;
      }
    }
    if (Object.keys(range).length) query.created_at = range;

    const [data, total] = await Promise.all([
      this.actionLogModel
        .find(query)
        .sort({ created_at: -1 })
        .skip(page * size)
        .limit(size)
        .lean()
        .exec(),
      this.actionLogModel.countDocuments(query).exec(),
    ]);
    return { data, total };
  }

  async findOne(id: string) {
    const log = await this.actionLogModel.findById(id).lean().exec();
    if (!log) throw new NotFoundException(`Action log ${id} not found`);
    return log;
  }
}
