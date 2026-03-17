---
title: "Why your BCG J-peak keeps drifting: a field guide to R→J delay variation"
excerpt: "After aligning hundreds of nights of ECG and BCG data, the ±50ms beat-level variation in R-to-J delay isn't noise — it's physiology."
date: "2026-02-28"
dateDisplay: "Feb 28, 2026"
readTime: 12
category: bcg
tag: "BCG · Signal Processing"
featured: true
---

## The R→J delay is not a constant

When you first build a BCG pipeline, you assume the time between the ECG R-peak and the BCG J-peak is roughly fixed — somewhere in the 180–240ms range at rest (widening to 150–300ms under hemodynamic perturbation) depending on your sensor placement. You build your beat detector, you align a few minutes of data, it looks great. Then you run it on a full night and the alignment falls apart.

The R→J delay drifts. Not randomly — physiologically. Understanding *why* is the difference between a pipeline that works in the lab and one that survives clinical validation.

![ECG and BCG waveforms showing the RJ interval — time between the R peak (electrical activation) and the J peak (mechanical ejection recoil)](/images/rj-interval.svg)

## What drives the delay: the pre-ejection period

The BCG J-peak is caused by the ballistic recoil of blood ejected from the left ventricle. The delay between electrical activation (R-peak) and mechanical ejection (J-peak) is dominated by the **pre-ejection period (PEP)** — the time the ventricle takes to build enough pressure to open the aortic valve.

PEP is not static. It shortens with sympathetic activation (exercise, stress, excitement) and lengthens with parasympathetic dominance (deep sleep, relaxation). Over a full night, PEP can vary by 40–80ms just from normal autonomic cycling. That's your drift.

## Breathing phase adds another layer

Intrathoracic pressure changes during breathing modulate venous return and therefore stroke volume. During inspiration, intrathoracic pressure falls, which transiently reduces left ventricular preload; by the Frank-Starling mechanism, stroke volume dips slightly and PEP lengthens by 10–20ms. During expiration, the opposite. This creates a sinusoidal oscillation in R→J delay at exactly the respiratory frequency (0.20–0.33 Hz, or 12–20 breaths/min, for a sleeping adult).

If your pipeline uses a fixed R→J offset to find J-peaks, it will systematically miss peaks at the extremes of each breath cycle. At 250 Hz, a 20ms error is 5 samples — enough to corrupt your HRV calculation entirely.

## Body position matters more than you think

Lateral decubitus (side sleeping) vs supine changes the hydrostatic load on the heart. The shift from supine to left-lateral typically increases PEP by 15–25ms. If your subject rolls over at 3am, a fixed-offset pipeline will lose sync for minutes until the SQI catches the bad beats and resets the tracker.

## Building a delay-adaptive beat tracker

The fix is a **local search window** rather than a fixed offset. For each R-peak, search for the maximum J-peak amplitude within a window of ±60ms around the expected delay. Update the expected delay with an exponential moving average:

`expected_delay = 0.85 × expected_delay + 0.15 × observed_delay`

This adapts to autonomic shifts on a beat-by-beat basis while being robust to single outliers. Combine it with an SQI gate — reject any beat where the J-peak amplitude falls below 0.4× the rolling median — and your pipeline becomes genuinely robust.

## The SQI is your last line of defence

No adaptive tracker catches everything. A well-designed Signal Quality Index should flag: low SNR segments, beats where the delay jumped by more than 2 standard deviations, and any 30s epoch where more than 25% of beats were rejected. These epochs should be excluded from downstream HRV and sleep staging — corrupted input to a good model is worse than no input at all.
