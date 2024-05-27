<script lang="ts">
	import { FirebaseError } from 'firebase/app';
	import {
		createUserWithEmailAndPassword,
		signInWithEmailAndPassword,
		signInWithRedirect
	} from 'firebase/auth';
	import { auth, provider } from '$lib/firebase';

	async function signInWithGoogle() {
		try {
			signInWithRedirect(auth, provider);
		} catch (error) {
			if (error instanceof FirebaseError) {
				console.log(error);
			}
		}
	}
	async function createNewUser(email: string, password: string) {
		if (password === password2) {
			try {
				await createUserWithEmailAndPassword(auth, email, password);
			} catch (error) {
				console.error('Error creating new user: ', error);
			}
		}
	}
	async function loginUser(email: string, password: string) {
		try {
			await signInWithEmailAndPassword(auth, email, password);
		} catch (error) {
			console.error('Error logging in user: ', error);
		}
	}

	let login = true;
	let winOpen = false;
	let email: string = '';
	let password: string = '';
	let password2: string = '';
	function open() {
		if (winOpen) {
			winOpen = false;
		} else {
			winOpen = true;
		}
	}
	function create() {
		login = false;
	}
</script>

<section class="flex justify-center">
	<div class="mt-20 border border-gray-500 rounded bg-gray-200 py-1 px-2">
		<button on:click={open}>ログイン / 新規作成</button>
	</div>
	{#if winOpen}
		<div id="page">
			<input type="text" placeholder="e-mail" name="email" bind:value={email} />
			<input type="text" placeholder="password" name="password" bind:value={password} />
			{#if login}
				<button on:click={() => loginUser(email, password)}>ログイン</button>
				<button on:click={create}>新規作成</button>
				<button on:click={signInWithGoogle}>Sign in with Google</button>
			{:else}
				<p>確認のためもう一度入力してください</p>
				<input type="text" placeholder="password" name="password" bind:value={password2} />
				<button on:click={() => createNewUser(email, password)}>ログイン</button>
			{/if}
		</div>
	{/if}
</section>