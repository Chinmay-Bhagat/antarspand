---
title: "Transformers for biosignals: what the hype gets right (and wrong)"
excerpt: "Attention mechanisms are genuinely useful for long-context physiological signals. The implementation details are where most papers quietly fail."
date: "2025-12-01"
dateDisplay: "Dec 2025"
readTime: 11
category: ml
tag: "Deep Learning"
featured: false
---

## Why attention makes sense for biosignals

The dominant prior for biosignal modelling was CNNs and LSTMs. CNNs are excellent at extracting local features — the shape of a J-peak, the morphology of a P-wave — but struggle with long-range dependencies. LSTMs handle longer context but suffer from vanishing gradients and are slow to train on sequences longer than a few thousand timesteps.

Transformers solve both problems. Self-attention scales to long context (an 8-hour overnight recording is ~7.2M samples at 250 Hz — feasible with sparse attention), and the architecture trains efficiently on modern hardware. For sleep staging, where the relevant context is an entire night's worth of autonomic dynamics, transformers are the right tool.

## What the hype gets right: long-context modelling

The genuine advantage is in capturing **circadian structure**. A LSTM sees the last N beats and extrapolates. A Transformer with a full-night attention window sees that HRV was elevated 3 hours ago, that the subject cycled through 2 complete REM periods, and that the current epoch's autonomic pattern is consistent with the final REM period of the night. This context dramatically improves late-night staging accuracy, where epoch-local features are ambiguous.

In our experiments, a Transformer trained with a 4-hour context window outperformed an LSTM with identical local features by 6 percentage points on Wake/REM discrimination — precisely the task that requires long-range context.

## What the hype gets wrong: positional encoding

Most biosignal Transformer papers apply sinusoidal positional encoding designed for NLP token sequences. Biosignals have very different positional statistics: the relevant periodicity is heartbeat-level (0.8–1.2s), respiratory-level (4–6s), and circadian (hours), simultaneously. Standard sinusoidal positional encoding (Vaswani 2017) does use multiple frequencies simultaneously across embedding dimensions — but those frequencies are fixed and tuned for NLP token scales, not for biosignal periodicities spanning heartbeat, respiratory, and circadian timescales. The mismatch is the problem, not the number of frequencies.

The fix: learnable multi-scale positional encodings, or better, a convolutional patch embedding layer that extracts local features before the Transformer processes the sequence. This reduces sequence length by 16–64× and lets the attention mechanism focus on inter-patch relationships rather than sample-level noise.

## The overfitting problem nobody talks about

BCG and sleep datasets are small. SHHS has ~6,441 unique subjects (the ~8,000 figure refers to PSG visits, not unique individuals) — and critically, SHHS contains no BCG data at all. BCG datasets are entirely separate, purpose-built collections, and they number in the hundreds of subjects at most. A full Transformer with 12 heads and 768 hidden dimensions will memorise training subjects. The published benchmarks often report leave-one-subject-out cross-validation results that don't reflect real-world generalisation.

Our production model uses 4 attention heads, 256 hidden dimensions, and heavy dropout (0.3). It scores 3 points lower on the benchmark than the overfit models but generalises correctly to new subjects on the first night — which is the only metric that matters in deployment.
