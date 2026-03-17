---
title: "BLE for overnight ECG: what the spec sheets don't tell you"
excerpt: "Bluetooth Low Energy looks ideal for overnight biosignal recording. The spec sheet omits the parts that will break your study."
date: "2025-12-01"
dateDisplay: "Dec 2025"
readTime: 7
category: hc
tag: "HealthTech"
featured: false
---

## The promise vs the reality

BLE looks perfect for overnight ECG: low power, standard protocol, iOS and Android support, 2Mbps PHY for data-hungry applications. The Polar H10 even implements the standard Heart Rate Profile. You should be able to start recording in an afternoon. You will not be able to start recording in an afternoon.

## The iOS background execution problem

iOS aggressively suspends background apps to preserve battery. A BLE-connected app that stops receiving user interaction will be backgrounded within minutes, and from background the system throttles your CoreBluetooth callbacks. In testing, we saw callback latency increase from <5ms to 200–800ms in background mode, with occasional multi-second gaps when the OS decided to fully suspend the process.

The fix is a combination of background task declarations in Info.plist (`bluetooth-central`), a silent local notification every 25 minutes to briefly wake the app, and a write-ahead log that detects and repairs timestamp gaps on next foreground activation. None of this is in the Polar SDK documentation.

## The 7-year epoch offset bug

The Polar H10 firmware timestamps ECG samples using a 64-bit nanosecond counter with epoch January 1, 2000 — a rollover horizon of roughly 584 years, so counter wraparound is not the issue. The actual problem is a fixed epoch offset: the H10 reports timestamps relative to its own 2000-based epoch, while your phone and most logging infrastructure assume Unix epoch (January 1, 1970). The difference is approximately 946,684,800 seconds. If you log raw H10 timestamps without correcting for this offset, all your timestamps are off by ~30 years, and any code that tries to correlate H10 data with wall-clock time will silently produce nonsense.

The fix is to apply the epoch offset correction at the BLE receive layer before the timestamps reach any other part of your pipeline. Simple once you know about it; completely non-obvious from the spec sheet.

## Connection parameter negotiation

BLE connection intervals are negotiated between central (phone) and peripheral (sensor). The Polar H10 requests a 7.5ms interval when streaming ECG at 130 Hz. iOS will grant this in foreground but may increase it to 30ms or more in background to reduce radio duty cycle. At 30ms intervals you can still stream 130 Hz ECG (the sensor buffers internally), but packet loss increases from <0.1% to 2–5% — enough to corrupt overnight HRV calculations.

Mitigation: request connection parameter updates from the peripheral side every 60 seconds. The iOS BLE stack will re-negotiate, and in practice the interval rarely exceeds 15ms even in background mode if you keep the connection active.
