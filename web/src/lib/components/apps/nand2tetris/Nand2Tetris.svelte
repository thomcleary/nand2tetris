<script lang="ts">
	let { onMinimise, onClose }: { onMinimise?: () => void; onClose?: () => void } = $props();
</script>

<button onclick={onClose}>nand2tetris</button>
