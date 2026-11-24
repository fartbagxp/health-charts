<script>
  // A "?" button that explains a term. Opens on hover, keyboard focus, or tap;
  // closes on mouse leave, blur, Escape, or scroll.
  let { text, label = 'What is this?' } = $props();
  const id = `infotip-${Math.random().toString(36).slice(2, 9)}`;
  let open = $state(false);
  let btn = $state(null);
  let bubble = $state(null);
  let pos = $state({ left: 0, top: 0 });

  // The bubble is position:fixed so chart cards (overflow: hidden) can't clip
  // it. It centres under the button, clamped 16px inside the viewport, and
  // closes on scroll rather than drifting away from the button.
  $effect(() => {
    if (!open || !btn || !bubble) return;
    const b = btn.getBoundingClientRect();
    const w = bubble.offsetWidth;
    const gutter = 16;
    const left = Math.min(Math.max(b.left + b.width / 2 - w / 2, gutter), window.innerWidth - gutter - w);
    pos = { left, top: b.bottom + 6 };
    const close = () => (open = false);
    window.addEventListener('scroll', close, { passive: true, once: true });
    return () => window.removeEventListener('scroll', close);
  });
</script>

<span class="infotip" onmouseenter={() => (open = true)} onmouseleave={() => (open = false)}>
  <button
    bind:this={btn}
    type="button"
    class="infotip-btn"
    aria-label={label}
    aria-describedby={id}
    aria-expanded={open}
    onclick={() => (open = true)}
    onfocus={() => (open = true)}
    onblur={() => (open = false)}
    onkeydown={(e) => { if (e.key === 'Escape') open = false; }}
  >?</button>
  <span {id} role="tooltip" class="infotip-bubble" class:open bind:this={bubble} style="left:{pos.left}px; top:{pos.top}px">{text}</span>
</span>

<style>
  /* A box one line tall, top-aligned with the heading's line, with the button
     centred in it, so the "?" sits level with the title text at any font size. */
  .infotip {
    position: relative;
    display: inline-flex;
    align-items: center;
    height: 1lh;
    margin-left: 0.4em;
    vertical-align: top;
  }

  .infotip-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.15rem;
    height: 1.15rem;
    padding: 0;
    border: 1px solid var(--border);
    border-radius: 50%;
    background: var(--bg);
    color: var(--fg-mid, #555);
    font-size: 0.7rem;
    font-weight: 700;
    line-height: 1;
    cursor: help;
  }

  .infotip-btn:hover,
  .infotip-btn:focus-visible {
    border-color: var(--fg-muted);
    color: var(--fg);
  }

  .infotip-bubble {
    display: none;
    position: fixed;
    z-index: 50;
    width: max-content;
    max-width: min(320px, calc(100vw - 32px));
    padding: 0.6rem 0.75rem;
    border: 1px solid var(--border);
    border-radius: 6px;
    background: var(--bg-card);
    color: var(--fg);
    box-shadow: 0 4px 14px rgb(0 0 0 / 0.12);
    font-size: 0.8rem;
    font-weight: 400;
    line-height: 1.45;
    text-align: left;
    white-space: normal;
  }

  .infotip-bubble.open {
    display: block;
  }
</style>
