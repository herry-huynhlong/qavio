import {headers} from 'next/headers';
import {redirect} from 'next/navigation';
import {adminOrigin} from '../config';
import {HttpError} from '../http';
import {authenticate,publicUser} from './auth';
import {allowed,permissions,type Permission} from './permissions';
export async function pageActor(permission:Permission='dashboard'){
  try{const auth=await authenticate(new Request(adminOrigin()+'/admin',{headers:new Headers(await headers())}),permission);return {user:publicUser(auth.user),csrfToken:auth.csrf,permissions:Object.keys(permissions).filter(p=>allowed(auth.user.role,p as Permission))};}
  catch(error){if(error instanceof HttpError){if(error.status===403)redirect('/admin/forbidden');if(error.status===401||error.status===503)redirect('/admin/login');}throw error;}
}
