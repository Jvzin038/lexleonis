import { getAccessToken } from '@base44/sdk';

const isNode = typeof window === 'undefined';

const isClearAccessTokenRequested = () =>
	!isNode && new URLSearchParams(window.location.search).get("clear_access_token") === 'true';

const clearStoredAccessToken = () => {
	window.localStorage.removeItem('base44_access_token');
	window.localStorage.removeItem('token');
}

const getAppParams = () => {
	if (isClearAccessTokenRequested()) {
		clearStoredAccessToken();
	}
	let arrivedWithToken = false;
	if (!isNode && window.location) {
		try {
			arrivedWithToken = new URLSearchParams(window.location.search).has('access_token');
		} catch (e) {}
	}
	return {
		appId: import.meta.env.VITE_BASE44_APP_ID,
		token: getAccessToken(),
		arrivedWithToken,
		functionsVersion: (!isNode && new URLSearchParams(window.location.search).get("functions_version")?.trim()) || import.meta.env.VITE_BASE44_FUNCTIONS_VERSION,
		appBaseUrl: import.meta.env.VITE_BASE44_APP_BASE_URL,
	}
}


export const appParams = {
	...getAppParams()
}