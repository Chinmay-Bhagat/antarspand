---
title: "The engineering stack behind contactless vitals: from PVDF film to sleep stage"
excerpt: "Sensor physics, ADC design, embedded firmware, cloud DSP, and the ML inference layer that ties it together."
date: "2026-01-04"
dateDisplay: "Jan 4, 2026"
readTime: 14
category: hc
tag: "HealthTech"
featured: false
---

## Five layers, one pipeline

Contactless vital sign monitoring sounds simple from the outside: put a sensor under a mattress, get heart rate and sleep stages. The reality is a five-layer engineering problem where a failure at any layer propagates to every layer above it. This is a map of those layers and the decisions that matter most at each one.

## Layer 1: Physics — the sensor

A PVDF film under a mattress measures the micro-vibrations caused by the ballistic recoil of cardiac ejection. The signal amplitude at the sensor surface is roughly 0.1–2mV peak-to-peak, depending on mattress hardness, subject weight, and sleeping position. Sensor placement matters: centred under the thoracic spine captures the strongest cardiac signal. Off-centre placement attenuates the J-peak by up to 60%.

The film must be sealed against moisture (sweat, humidity) and mechanically isolated from the mattress frame to prevent structural vibration from coupling in. A 3mm foam decoupling layer on both sides of the film is sufficient for most spring mattress frames.

## Layer 2: Electronics — ADC design

The PVDF output is a high-impedance charge signal. A standard instrumentation amplifier is the wrong choice here — its voltage-mode input will load the sensor and severely attenuate the signal. PVDF requires a **charge amplifier**: a transimpedance topology with a large feedback resistor (typically 1–10 GΩ) that converts the sensor's charge output to a voltage without loading it. We use a charge amplifier with a gain set for 0.1–2mV full-scale input, followed by a 2-pole Butterworth bandpass filter (0.1–25 Hz) before digitisation.

ADC resolution: 16-bit at 250 Hz is sufficient. The theoretical dynamic range (96 dB) far exceeds what you need — the limiting factor is your analog front-end noise floor, typically 2–5µV RMS with careful layout. Keep the ADC physically close to the sensor to minimise trace inductance.

## Layer 3: Firmware — embedded signal handling

The embedded processor (we use an ESP32-S3) handles local buffering, BLE transmission, and basic SQI gating. Critical decisions: use DMA for ADC reads to avoid sampling jitter, implement a circular buffer with 10-second overlap for seamless epoch boundaries, and timestamp every sample with microsecond resolution from the RTC — timestamp drift is the most common source of mysterious alignment bugs in multi-sensor setups.

## Layer 4: Cloud DSP — the processing pipeline

Raw BCG arrives at the cloud pipeline as 250 Hz integer samples. The pipeline applies: (1) a notional 50/60 Hz notch filter for mains interference, (2) a 0.5–15 Hz bandpass for cardiac extraction (primary cardiac BCG energy sits in 1–8 Hz; the wider filter preserves harmonics and avoids phase distortion at band edges), (3) a CWT-based J-peak detector with adaptive threshold, (4) RR interval extraction and HRV feature computation per 5-minute segment.

## Layer 5: ML inference — sleep staging

The final layer is a Transformer model operating on 30-second epochs of HRV features (SDNN, RMSSD, LF/HF ratio, sample entropy) plus raw BCG spectrogram. It outputs a 4-class sleep stage probability distribution. The model runs on GPU inference with a 5-minute latency budget — we process each night's data in batch after the session ends rather than streaming in real-time, which eliminates latency constraints and simplifies the pipeline significantly.
