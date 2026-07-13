// Custom entry point: load polyfills before anything else (including React
// Native core and dependencies) so globals like DOMException exist by the time
// any module evaluates.
import 'react-native-get-random-values';
import './polyfills';
import { registerRootComponent } from 'expo';
import App from './App';

registerRootComponent(App);
