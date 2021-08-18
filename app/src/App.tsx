import { withAuthenticator } from '@aws-amplify/ui-react';

import Chart from './pages/Chart';

function App() {
  return <Chart />;
}

export default withAuthenticator(App);
