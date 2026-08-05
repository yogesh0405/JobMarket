import { registerRootComponent } from 'expo';
import App from './App';

const RootComponent = (App as any)?.default || App;
registerRootComponent(RootComponent);
