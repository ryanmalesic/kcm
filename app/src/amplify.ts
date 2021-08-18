import { Auth } from 'aws-amplify';

import consts from './consts';

const config = {
  API: {
    endpoints: [
      {
        name: consts.apiName,
        endpoint: consts.apiUrl,
        custom_header: async () => {
          return {
            Authorization: `Bearer ${(await Auth.currentSession())
              .getAccessToken()
              .getJwtToken()}`,
          };
        },
      },
    ],
  },
  Auth: {
    region: consts.region,
    userPoolId: consts.userPoolId,
    userPoolWebClientId: consts.userPoolWebClientId,
  },
};

export default config;
