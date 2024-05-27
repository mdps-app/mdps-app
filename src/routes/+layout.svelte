<script>
	import '../app.css';
	import { BottomNav, BottomNavItem, Skeleton, ImagePlaceholder } from 'flowbite-svelte';
	import {
		HomeSolid,
		DatabaseSolid,
		MapPinSolid,
		UserSettingsSolid
	} from 'flowbite-svelte-icons';
	import { page } from '$app/stores';
	$: activeUrl = $page.url.pathname;
</script>

<div>
	<BottomNav {activeUrl} position="absolute" classInner="grid-cols-4">
		<BottomNavItem btnName="Home" href="/">
			<HomeSolid />
		</BottomNavItem>
		<BottomNavItem btnName="Database" href="/database" exact={false}>
			<DatabaseSolid />
		</BottomNavItem>
		<BottomNavItem btnName="Map" href="/map" exact={false}>
			<MapPinSolid />
		</BottomNavItem>
		<BottomNavItem btnName="Settings" href="/settings" exact={false}>
			<UserSettingsSolid />
		</BottomNavItem>
	</BottomNav>
	<slot />
</div>
