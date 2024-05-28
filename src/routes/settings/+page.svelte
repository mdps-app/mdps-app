<script lang="ts">
	import { onMount } from 'svelte';
	import { auth, db } from '$lib/firebase';
	import { collection, getDocs } from 'firebase/firestore';
	import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
	import { P, Heading, Card, Button, DarkMode } from 'flowbite-svelte';
	import { ArrowRightOutline } from 'flowbite-svelte-icons';

	let userId: string | null;
	let userEmail: string | null;
	onAuthStateChanged(auth, (user) => {
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

<div class="container p-12">
	<Heading class="text-2xl mb-4 font-bold tracking-tight text-gray-900 dark:text-white">Account</Heading>
	{#if userId}
		<Card class="gap-2">
			<Heading class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
				ログイン済み
			</Heading>
			<P>ユーザー: {userEmail}</P>
			<Button class="w-fit" on:click={() => auth.signOut()}>
				Logout
			</Button>
		</Card>
	{:else}
		<Card class="gap-2">
			<Heading class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Guest</Heading>
			<Button class="w-fit" on:click={login}>
				Login <ArrowRightOutline class="ms-2 h-6 w-6 text-white" />
			</Button>
		</Card>
	{/if}
	<Heading class="mt-8 mb-4 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Theme</Heading>
	<div class="flex items-center gap-4">
		<P>Dark mode</P>
		<DarkMode />
	</div>
</div>
