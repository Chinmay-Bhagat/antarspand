---
title: "PVDF vs capacitive: which sensor survives a restless sleeper?"
excerpt: "Two sensor modalities, one hostile environment. After six months of field testing, here is what actually breaks."
date: "2026-01-18"
dateDisplay: "Jan 18, 2026"
readTime: 5
category: hw
tag: "Sensor Hardware"
featured: false
---

## The real test is not the lab

PVDF film and capacitive pressure sensors both look fine in a controlled lab setting with a motionless subject. The lab is not where they fail. They fail at 2am when someone rolls over aggressively, kicks the sensor, or sleeps on their stomach with 80kg of body weight concentrated on a single mattress zone.

## PVDF: excellent dynamic range, terrible DC response

Polyvinylidene fluoride film is a piezoelectric material — it generates charge in proportion to *changes* in applied force. This makes it excellent for capturing the high-frequency ballistic cardiac signal (1–20 Hz) but completely blind to static load. If your subject stops moving, the PVDF output drifts to zero regardless of how much they weigh.

For BCG this is actually a feature: the sensor naturally high-pass filters out the slow postural load and passes the cardiac signal. The problem comes with **motion artifacts** — a restless sleeper generates large-amplitude, low-frequency signals as they shift position, which saturate the amplifier and corrupt 30–90 seconds of data per movement event.

## Capacitive: stable baseline, compression nonlinearity

Capacitive sensors measure the absolute gap between two conductive plates — they respond to both static load and dynamic changes. This gives them a stable DC baseline but introduces a significant problem: the sensitivity varies with compression. A sensor calibrated for a 60kg subject reads differently under an 80kg subject, and the relationship is nonlinear.

In practice, capacitive sensors require per-subject calibration or a normalisation step in the DSP pipeline. They also saturate at high loads — foam-based capacitive sensors in mattress toppers typically clip above 120kg, which excludes a significant portion of real-world users.

## The verdict after six months of field data

PVDF wins for signal quality on calm nights. Capacitive wins for robustness on restless nights. The hybrid approach — PVDF for primary cardiac extraction with a capacitive sensor for posture classification and SQI gating — outperforms either modality alone. When the capacitive sensor detects a posture change, you gate out the PVDF signal for 45 seconds and wait for it to stabilise. This single design decision reduced our artifact rate by 62% in field deployment.
