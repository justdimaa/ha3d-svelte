import { browser } from '$app/environment';
import { connect } from './stores/global';

if (browser) {
	connect();
}
