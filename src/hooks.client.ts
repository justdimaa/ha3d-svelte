import { browser } from '$app/environment';
import { connect } from '$lib/shared/stores/global';

if (browser) {
	connect();
}
