<script lang="ts">
    import { Card, P } from "flowbite-svelte";

    export let point: any;
    export let className: string = "";
</script>

<div class="w-full h-full">
    <Card class={className}>
        {point}
    </Card>
</div>