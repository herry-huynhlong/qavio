import {validateEnvironment} from './runtime-environment.mjs';
try{validateEnvironment();}catch{console.error('QAVIO_STARTUP_ENVIRONMENT_REJECTED');process.exit(1);}
await import('../server.js');
