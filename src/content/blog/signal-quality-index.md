---
title: "Building a Signal Quality Index from scratch"
excerpt: "An SQI is the immune system of your BCG pipeline. Here is how to build one that actually rejects bad data without being paranoid."
date: "2025-11-01"
dateDisplay: "Nov 2025"
readTime: 9
category: bcg
tag: "BCG"
featured: false
---

## What an SQI is and why you need one

A Signal Quality Index is a gating function that assigns each segment of BCG data a quality score and rejects segments below a threshold before they reach your beat detector or ML model. Without an SQI, a single 10-second motion artifact can corrupt 5 minutes of downstream HRV calculation — not because the artifact itself is long, but because the beat tracker loses synchrony and takes time to recover.

The goal is not to maximise data quantity. It is to maximise data trustworthiness. A night with 65% of epochs accepted by a strict SQI is more useful than a night with 95% accepted by a permissive one, if the rejected 30% would have corrupted the HRV features.

## Feature 1: SNR in the cardiac band

Compute the power spectral density of each 10-second BCG segment. Cardiac signal power — fundamental and harmonics — spans 1–8 Hz. BCG has significant harmonic energy up to ~8 Hz, so treating the 5–20 Hz band as pure noise will penalise good signals with rich harmonics. A better split: cardiac band 1–8 Hz, noise band 10–20 Hz (with 8–10 Hz as a transition zone to avoid penalising harmonic-rich beats). The SNR ratio is your primary quality signal:

`SNR = 10 × log10(P_cardiac / P_noise)`

In our dataset, segments with SNR > 6 dB produced reliable J-peak detections. Below 0 dB, the beat detector fails on more than 40% of beats. The SNR threshold is the single most important parameter in your SQI — tune it on a labelled validation set, not by intuition.

## Feature 2: Template correlation

Build a rolling template of the BCG waveform from the last 20 clean beats (normalised amplitude, aligned to J-peak). For each candidate beat, compute the Pearson correlation between the beat waveform and the template. A healthy BCG beat should correlate at r > 0.7 with the template. Ectopic beats, motion artifacts, and signal dropouts all produce lower correlations.

This feature catches the cases SNR misses: a high-amplitude motion artifact can have perfectly normal SNR if the artifact energy falls in the cardiac band (which it sometimes does, because human movement happens at 1–3 Hz).

## Feature 3: Isolation Forest for outlier beats

Feed [RR interval, J-peak amplitude, template correlation, SNR] as a 4-dimensional feature vector into an Isolation Forest trained on clean overnight data. Isolation Forest assigns an anomaly score to each beat — outlier beats in any combination of these features get flagged.

The advantage over a fixed threshold on each feature individually: it catches the subtle interactions. A beat with slightly low correlation AND slightly low SNR AND slightly short RR interval might pass each individual threshold but correctly fail the joint outlier test.

## Adaptive thresholds, not fixed ones

The right SNR threshold for a 60kg supine subject is different from the right threshold for a 95kg side-sleeping subject. Implement per-night threshold adaptation: compute the 20th percentile of SNR from the first 30 minutes of each recording and set the night's threshold at that value minus 2 dB. This automatically adjusts for subject and position without manual tuning.
