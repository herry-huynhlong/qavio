import type {Prisma} from '@prisma/client';
import type {Transaction} from '../db';
export function audit(tx:Transaction,actorId:string|null,action:string,targetType:string,targetId:string|null,changes:Prisma.InputJsonObject={}){
  return tx.auditLog.create({data:{actorId,action,targetType,targetId,changes}});
}
