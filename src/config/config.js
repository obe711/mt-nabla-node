const dotenv = require('dotenv');
const path = require('node:path');
const Joi = require('joi');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
    NABLA_PORT: Joi.number().default(41234),
    NABLA_HUB_IP: Joi.string().required(),
    NABLA_HUB_PORT: Joi.number().required(),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
  env: envVars.NODE_ENV,
  nablaPort: envVars.NABLA_PORT,
  hub: {
    ip: envVars.NABLA_HUB_IP,
    port: envVars.NABLA_HUB_PORT
  }
};