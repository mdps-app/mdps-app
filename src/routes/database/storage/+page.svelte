<script lang="ts">
	import { onMount } from 'svelte';
	import QRCode from 'qrcode';
	import { db, type Item } from '$lib/firebase';
	import {
		QuerySnapshot,
		collection,
		deleteDoc,
		doc,
		onSnapshot,
		orderBy,
		query,
		updateDoc
	} from 'firebase/firestore';
	import {
		Heading,
		Card,
		Img,
		Skeleton,
		ImagePlaceholder,
		Input,
		Button,
		Modal,
		Select
	} from 'flowbite-svelte';
	import Map from '$lib/component/Map.svelte';
	import { getAuth, onAuthStateChanged } from 'firebase/auth';

	let storage: Item[] = [];
	let groups: { value: string; name: string }[] = [];
	let matchedItem: Item | undefined;
	let quCodeUrl: any = '';

	let itemName: string;
	type GroupName = '' | (typeof groups)[number]['name'];
	let itemGroup: GroupName = '';
	let itemNum: number;
	let itemTerm: string;
	let itemTermH: string;
	let itemZone: string;

	let auth: any = null;

	onMount(async () => {
		const firebaseAuth = getAuth();
		onAuthStateChanged(firebaseAuth, (user) => {
			auth = user;
		});
	});

	onMount(async () => {
		if (typeof window !== 'undefined') {
			const urlParams = new URLSearchParams(window.location.search);
			const id = urlParams.get('id');

			onSnapshot(
				query(collection(db, 'storage'), orderBy('name')),
				(snapshot: QuerySnapshot): any => {
					storage = snapshot.docs.map((doc) => {
						const data = doc.data();
						const item: Item = {
							id: doc.id,
							name: data.name,
							group: data.group,
							num: data.num,
							term: data.term,
							termH: data.termH,
							zone: data.zone
						};
						return item;
					});

					matchedItem = storage.find((item) => item.id === id);

					if (matchedItem) {
						itemName = matchedItem.name;
						itemGroup = matchedItem.group;
						itemNum = matchedItem.num;
						itemTerm = matchedItem.term
							? new Date(matchedItem.term).toISOString().split('T')[0]
							: '';
						itemTermH = matchedItem.termH
							? new Date(matchedItem.termH).toISOString().split('T')[0]
							: '';
						itemZone = matchedItem.zone;
					}
				}
			);

			onSnapshot(query(collection(db, 'groups'), orderBy('name')), (snapshot: QuerySnapshot) => {
				groups = snapshot.docs.map((doc) => {
					const data = doc.data();
					return {
						value: doc.id,
						name: data.name
					};
				});
			});

			if (typeof window !== 'undefined') {
				quCodeUrl = await QRCode.toDataURL(window.location.href);
			}
		}
	});

	let editMordal = false;

	function updateItem(item: Item) {
		if (!item.id) return;
		const newItem: Item = {
			name: itemName,
			group: itemGroup,
			num: itemNum,
			term: itemTerm,
			termH: itemTermH,
			zone: itemZone
		};

		updateDoc(doc(db, 'storage', item.id), newItem);
	}

	let delModal = false;

	function delItem(item: Item) {
		if (!item.id) return;
		deleteDoc(doc(db, 'storage', item.id));
	}
</script>

{#if matchedItem}
	<Modal title="Update item" bind:open={editMordal} autoclose>
		<Input bind:value={itemName} placeholder="Item name" />
		<Select bind:value={itemGroup} items={groups} placeholder="Group" />
		<Input bind:value={itemNum} placeholder="Number" />
		<Input bind:value={itemTerm} placeholder="Term" type="date" />
		<Input bind:value={itemTermH} placeholder="TermH" type="date" />
		<Input bind:value={itemZone} placeholder="Zone" />
		<svelte:fragment slot="footer">
			<Button on:click={() => matchedItem && updateItem(matchedItem)}>Update item</Button>
			<Button color="alternative">cancel</Button>
		</svelte:fragment>
	</Modal>
{/if}
{#if delModal}
	<Modal title="Delete item" bind:open={delModal} autoclose>
		<p>本当に削除しますか？</p>
		<svelte:fragment slot="footer">
			<Button on:click={() => matchedItem && delItem(matchedItem)}>Delete</Button>
			<Button color="alternative">cancel</Button>
		</svelte:fragment>
	</Modal>
{/if}

<div class="p-12 w-full">
	<Heading class="mb-4 text-2xl font-bold tracking-tight text-gray-900 dark:text-white"
		>Database</Heading
	>
	<div class="w-full lg:flex gap-5">
		{#if matchedItem}
			<Card class="mb-5">
				<Heading class="mb-4 text-2xl font-bold tracking-tight text-gray-900 dark:text-white"
					>{matchedItem.name}</Heading
				>
				<div class="flex flex-col mb-4">
					<div class="flex items-center">
						<p class="text-gray-600 dark:text-gray-400">グループ:</p>
						<p class="ml-2 text-gray-900 dark:text-white">{matchedItem.group}</p>
					</div>
					<div class="flex items-center">
						<p class="text-gray-600 dark:text-gray-400">個数:</p>
						<p class="ml-2 text-gray-900 dark:text-white">{matchedItem.num}</p>
					</div>
					<div class="flex items-center">
						<p class="text-gray-600 dark:text-gray-400">保存期間:</p>
						<p class="ml-2 text-gray-900 dark:text-white">{matchedItem.term}</p>
					</div>
					<div class="flex items-center">
						<p class="text-gray-600 dark:text-gray-400">保保管期間:</p>
						<p class="ml-2 text-gray-900 dark:text-white">{matchedItem.termH}</p>
					</div>
					<div class="flex items-center">
						<p class="text-gray-600 dark:text-gray-400">保保管区域:</p>
						<p class="ml-2 text-gray-900 dark:text-white">{matchedItem.zone}</p>
					</div>
				</div>
				<div>
					<Heading class="mb-4 text-2xl font-bold tracking-tight text-gray-900 dark:text-white"
						>QR code</Heading
					>
					<Img src={quCodeUrl} alt="QR code" class="w-64 h-64" />
				</div>
				<div class="flex gap-4 mt-4">
					{#if auth}
						<Button on:click={() => (editMordal = true)}>Edit</Button>
						<Button on:click={() => (delModal = true)}>Delete</Button>
					{:else}
						<Button disabled>Edit</Button>
						<Button disabled>Delete</Button>
					{/if}
				</div>
			</Card>
			<Map className="lg:flex-grow" point={matchedItem.zone} />
		{:else}
			<div class="mt-10">
				<Skeleton class="h-64 w-64" />
				<ImagePlaceholder class="h-64 w-64" />
			</div>
		{/if}
	</div>
</div>
