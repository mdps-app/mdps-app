<script>
	import '../app.css';
	import { BottomNav, BottomNavItem, Skeleton, ImagePlaceholder } from 'flowbite-svelte';
	import { HomeSolid, DatabaseSolid, MapPinSolid, UserSettingsSolid } from 'flowbite-svelte-icons';
	import { page } from '$app/stores';
	$: activeUrl = $page.url.pathname;
</script>

<div class="w-full h-full">
	<BottomNav {activeUrl} position="fixed" classInner="grid-cols-4">
		<BottomNavItem btnName="Home" href="/">
			<HomeSolid class="text-gray-500 dark:text-gray-400" />
		</BottomNavItem>
		<BottomNavItem btnName="Database" href="/database" exact={false}>
			<DatabaseSolid class="text-gray-500 dark:text-gray-400" />
		</BottomNavItem>
		<BottomNavItem btnName="Map" href="/map" exact={false}>
			<MapPinSolid class="text-gray-500 dark:text-gray-400" />
		</BottomNavItem>
		<BottomNavItem btnName="Settings" href="/settings" exact={false}>
			<UserSettingsSolid class="text-gray-500 dark:text-gray-400" />
		</BottomNavItem>
	</BottomNav>
	<slot />
</div>

<style>
	:global(body) {
		@apply bg-gray-50 dark:bg-gray-600;
		width: 100vw;
		height: calc(100vh - 64px);
	}
</style>
