import { Request, Response } from 'express';

import db from '../database/connection';
import convertHourToMinutes from '../utils/convertHourToMinutes';

interface ScheduleItem {
  week_day: number,
  from: string,
  to: string
}

export default class ClassesController {
  async index(request: Request, response: Response) {
    const filters = request.query;

    const week_day = filters.week_day as string;
    const subject = filters.subject as string;
    const time = filters.time as string;

    const query = db('classes as c')
      .whereExists(query =>
        query
          .select('*')
          .from('class_schedule as cs')
          .whereRaw('"cs"."class_id" = "c"."id"')
          .modify(query => {
            if (filters.week_day) {
              query.whereRaw('week_day = ?', week_day);
            }
            if (filters.time) {
              const timeInMinutes = time.length ? convertHourToMinutes(time) : 0;
              query.whereRaw('"from" <= ?', timeInMinutes).whereRaw('"to" > ?', timeInMinutes);
            }
          })
      )
      .select(['c.*', 'u.*'])
      .join('users as u', { 'c.user_id': 'u.id' });
    if (filters.subject) {
      query.where({ subject });
    }
    const classes = await query;

    return response.json(classes);
  }

  async create(request: Request, response: Response) {
    const { name, avatar, whatsapp, bio, subject, cost, schedule } = request.body;
  
    const trx = await db.transaction();
  
    try {
      const insertedUsersIds = await trx('users').insert({
        name,
        avatar,
        whatsapp,
        bio
      });
    
      const user_id = insertedUsersIds[0];
    
      const insertedClassesIds = await trx('classes').insert({
        subject,
        cost,
        user_id
      });
    
      const class_id = insertedClassesIds[0];
    
      const classSchedule = schedule.map((scheduleItem: ScheduleItem) => {
        return {
          class_id,
          week_day: scheduleItem.week_day,
          from: convertHourToMinutes(scheduleItem.from),
          to: convertHourToMinutes(scheduleItem.to)
        };
      });
    
      await trx('class_schedule').insert(classSchedule);
    
      await trx.commit();
    
      return response.status(201).send();
    } catch (err) {
      await trx.rollback();
      
      return response.status(400).json({
        error: 'Unexpected error while creating new class.'
      });
    }
  }
}