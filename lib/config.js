const environments = {};

environments.staging = {
  httpPort: 3000,
  httpsPort: 3001,
  envName: "staging",
  hashingSecret: "thisIsASecret",
  maxChecks: 5,
  twilio: {
    accountSid: "AC99f60c5cfbcffd55ea2605ad2ee1ff95",
    authToken: "b193145532966038aa2ed92dec15f943",
    fromPhone: "+16205829145",
  },
};

environments.production = {
  httpPort: 5000,
  httpsPort: 5001,
  envName: "production",
  hashingSecret: "thisIsASecret",
  maxChecks: 5,
};

const currentEnvironment =
  typeof process.env.NODE_ENV == "string"
    ? process.env.NODE_ENV.toLowerCase()
    : "";

const environmentToExport =
  typeof environments[currentEnvironment] == "object"
    ? environments[currentEnvironment]
    : environments.staging;

module.exports = environmentToExport;
 


