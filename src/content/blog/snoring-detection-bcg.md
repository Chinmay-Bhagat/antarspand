---
title: "Snoring detection from BCG: separating breath from ballistic noise"
excerpt: "Snoring produces a characteristic vibration signature in BCG. Isolating it from cardiac and respiratory signals requires understanding all three simultaneously."
date: "2025-10-01"
dateDisplay: "Oct 2025"
readTime: 6
category: bcg
tag: "BCG / HRV"
featured: false
---

## Why BCG captures snoring

Snoring is caused by the vibration of upper airway soft tissue during inspiration. These vibrations couple mechanically through the body and into the mattress — the same pathway that delivers the cardiac BCG signal. Snoring vibration frequency is typically 50–500 Hz, well above the cardiac band, which makes spectral separation possible in theory. In practice, the overlap with respiratory harmonics and mattress resonance modes makes it harder than it looks.

## The frequency domain signature

A 30-second BCG spectrogram of a snoring episode shows: (1) the normal cardiac band at 1–4 Hz, (2) respiratory modulation at 0.18 Hz, (3) a broadband elevation in the 60–200 Hz range with a dominant harmonic at the snoring fundamental frequency. The fundamental varies between subjects and snoring type: simple palatal snoring typically peaks around 100–150 Hz (median ~137 Hz), while the heavy vibratory snoring associated with OSA events tends to be higher frequency and more irregular — not lower.

## Separation strategy

Apply a three-band decomposition to each 30-second epoch: (1) lowpass at 20 Hz for cardiac/respiratory extraction (normal BCG pipeline), (2) bandpass 20–500 Hz for snoring extraction, (3) a notch filter bank at the mains frequency and its harmonics to remove electrical interference.

The snoring band energy alone is not sufficient for classification — body movement produces similar broadband energy. The discriminating feature is **periodicity**: snoring occurs at the respiratory rate (one snore per breath), while body movement artifacts are aperiodic. A short-time autocorrelation of the snoring band with lag equal to the current respiratory period separates snoring from movement with >85% accuracy.

## Connecting snoring to sleep staging

Snoring rate and intensity are clinically relevant beyond nuisance detection. Heavy snoring concentrated in specific sleep stages is a marker for upper airway resistance syndrome. Snoring that stops abruptly and is followed by a post-apnea HRV surge is a strong indicator of an obstructive event. Integrating the snoring detector output as a feature in the sleep staging model improved OSA event detection sensitivity from 71% to 84% in our validation dataset — a meaningful clinical improvement from a sensor that was already there.
