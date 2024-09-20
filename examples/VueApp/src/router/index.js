import { createRouter, createWebHistory } from 'vue-router';
import Home from '../pages/index.vue';
import Page from '../pages/protected.vue';

const routes = [
	{
		path: '/',
		name: 'Home',
		component: Home,
	},
	{
		path: '/protected',
		name: 'Protected',
		component: Page,
	},
];

const router = createRouter({
	history: createWebHistory(),
	routes,
});

export default router;
