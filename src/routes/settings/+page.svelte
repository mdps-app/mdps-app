<script lang="ts">
	import { onMount } from 'svelte';
	import { slide } from 'svelte/transition';
	import { authStore } from '$lib/store';
	import { auth, db } from '$lib/firebase';
	import { collection, getDocs } from 'firebase/firestore';
	import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
	import { P, Heading, Card, Button, DarkMode, Toast } from 'flowbite-svelte';
	import { ArrowRightOutline, CheckCircleSolid, CloseCircleSolid } from 'flowbite-svelte-icons';

	let userId: string | null;
	let userEmail: string | null;
	onAuthStateChanged(auth, (user) => {
		authStore.set({ loggedIn: !!user, user: user });
		userId = user ? user.uid : null;
		userEmail = user ? user.email : null;
	});

	const approvedUsers: string[] = [];

	onMount(async () => {
		const querySnapshot = await getDocs(collection(db, 'approvedUsers'));
		querySnapshot.docs.forEach((doc) => {
			approvedUsers.push(doc.data().email);
		});
	});

	let loginSuccess = false;

	function login() {
		const provider = new GoogleAuthProvider();
		signInWithPopup(auth, provider)
			.then((result) => {
				// ユーザーが承認されたリストに存在するかチェック
				if (result.user && result.user.email && approvedUsers.includes(result.user.email)) {
					console.log('ログイン成功');
				} else {
					console.log('このユーザーは承認されていません');
					auth.signOut();
				}
			})
			.catch((error) => {
				console.log('ログイン失敗', error);
			});
	}
</script>

<Toast color="green" bind:open={loginSuccess}>
	<svelte:fragment slot="icon">
		<CheckCircleSolid class="w-5 h-5" />
		<span class="sr-only">Check icon</span>
	</svelte:fragment>
	Item moved successfully.
</Toast>

<Toast color="red">
	<svelte:fragment slot="icon">
		<CloseCircleSolid class="w-5 h-5" />
		<span class="sr-only">Error icon</span>
	</svelte:fragment>
	Item has been deleted.
</Toast>

<div class="container p-12">
	<Heading class="mb-4 text-2xl font-bold tracking-tight text-gray-900 dark:text-white"
		>Account</Heading
	>
	{#if userId}
		<Card class="gap-2">
			<Heading class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
				ログイン済み
			</Heading>
			<P>ユーザー: {userEmail}</P>
			<Button class="w-fit" on:click={() => auth.signOut()}>Logout</Button>
		</Card>
	{:else}
		<Card class="gap-2">
			<Heading class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white"
				>Guest</Heading
			>
			<Button class="w-fit" on:click={login}>
				Login <ArrowRightOutline class="ms-2 h-6 w-6 text-white" />
			</Button>
		</Card>
	{/if}
	<Heading class="mb-4 mt-8 text-2xl font-bold tracking-tight text-gray-900 dark:text-white"
		>Theme</Heading
	>
	<div class="flex items-center gap-4">
		<P>Dark mode</P>
		<DarkMode />
	</div>
</div>
