---
title: "ECG and BCG: Reading Your Heart's Electrical and Mechanical Signatures"
excerpt: "Every heartbeat leaves two distinct traces — an electrical fingerprint in the ECG and a mechanical recoil signature in the BCG. Understanding both is the foundation of contactless cardiac monitoring."
date: "2026-03-31"
dateDisplay: "Mar 31, 2026"
readTime: 10
category: bcg
tag: "BCG · ECG · Signal Processing"
featured: true
---

Every time your heart contracts, two things happen in sequence: an electrical signal triggers the muscle, and the muscle's mechanical response ejects blood — and by Newton's third law, your entire body recoils in the opposite direction.

These two events are measurable. The ECG captures the electrical side. The BCG captures the mechanical. Together, they give a more complete picture of cardiac function than either alone — and understanding both is the foundation of everything from HRV analysis to contactless sleep monitoring.

---

## The ECG waveform

An electrocardiogram (ECG) records the electrical potentials generated as cardiac muscle cells depolarise and repolarise. What you see on the trace is a repeating pattern of labelled waves and segments — P, QRS, and T.

![A labelled ECG waveform showing the P wave, QRS complex, and T wave with interval annotations](/images/ecg-waveform-labeled.svg)

### P wave

The P wave is a small, rounded deflection that opens every cardiac cycle. It represents **atrial depolarisation** — the electrical wavefront spreading across the right and left atria, signalling them to contract and push blood into the ventricles.

Duration: ~80–120 ms. Amplitude: ~0.25 mV in a standard limb lead. It's easy to miss on noisy signals, but its presence confirms that the heartbeat was initiated normally at the sinoatrial node.

### QRS complex

The QRS complex is the most prominent feature — a sharp, narrow spike representing **ventricular depolarisation**. Nearly 600g of ventricular muscle depolarises almost simultaneously, which is why the QRS is tall, fast, and unmistakable.

- **Q wave** — Small negative deflection. Septal depolarisation: the interventricular wall activates first, spreading leftward away from a right-sided electrode.
- **R wave** — The tall positive spike. The main ventricular wall depolarising toward the recording electrode. This is the peak that beat-detection algorithms lock onto — it is the timing reference for the entire cardiac cycle.
- **S wave** — Small negative deflection after R. The basal portions of the ventricle (closest to the atria) activating last.

Normal QRS duration: 80–120 ms. Widening beyond 120 ms suggests a bundle branch block or aberrant conduction.

### ST segment

The flat segment between the QRS and T wave. The ventricles are fully depolarised and actively contracting — this is systole. Under normal conditions, the ST segment sits at baseline. Elevation or depression is a key diagnostic marker for myocardial ischaemia.

### T wave

The T wave is a broader, more rounded deflection representing **ventricular repolarisation** — the ventricles resetting electrically after contraction, preparing for the next beat. It travels in the same direction as the R wave because repolarisation occurs in reverse sequence to depolarisation.

The QT interval (from the start of Q to the end of T) is a measure of total ventricular electrical activity duration. Prolonged QT is a risk factor for life-threatening arrhythmias.

---

## The BCG waveform

The ballistocardiogram (BCG) is a fundamentally different signal. It does not measure electricity — it measures the **mechanical recoil of the body** as blood is ejected by the heart.

When the left ventricle fires, it ejects roughly 70 ml of blood through the aorta in a headward direction. The body, by Newton's third law, recoils footward. A sensor under the mattress — or embedded in a chair or scale — picks up these tiny whole-body displacements. The resulting waveform is the BCG.

![A labelled BCG waveform showing the H, I, J, K, L, and M peaks](/images/bcg-waveform-labeled.svg)

The naming convention for BCG peaks is alphabetical, picking up where the ECG left off (the ECG uses letters A through H, so BCG's main peaks start at H and continue).

### H wave

A small, variable wave appearing just before the main complex. It corresponds to the atrial kick during late diastolic filling — a minor recoil as the atria contract and push blood into the ventricles. Often subtle and sometimes absent, especially at higher heart rates when diastole shortens.

### I wave

A clear negative (footward) deflection immediately before the J peak. This is the **isovolumetric contraction phase** — the ventricles are contracting forcefully, pressure is building, but the aortic valve has not yet opened. The body is being accelerated footward in anticipation of ejection, producing a downward deflection in the BCG trace.

### J wave

The J wave is the **dominant feature of the BCG** — a large positive (headward) peak. It occurs when the aortic valve opens and blood is ejected rapidly into the ascending aorta. Because blood accelerates headward, the body recoils footward, but the convention used in most BCG systems records this as a positive deflection representing the headward recoil of the upper body.

The J peak is the BCG equivalent of the ECG's R peak. It is the reference point for beat detection, heart rate calculation, and HRV analysis from a contactless sensor. Signal quality in BCG pipelines is typically evaluated around the J peak — if you can reliably detect J, you can do everything else.

### K wave

A negative deflection following the J peak, representing the **deceleration phase** of ejection. Blood ejection velocity is slowing, the aortic valve is approaching closure, and the body decelerates from its headward recoil. The net result is a footward acceleration — hence the downward K wave.

### L and M waves

Smaller, less consistent deflections in early and mid diastole. They reflect the complex pressure and flow dynamics as blood decelerates in the aorta, the aortic valve closes, and diastolic filling begins. Their amplitudes and timing vary more between individuals than H, I, J, and K.

---

## How they relate: the R-to-J delay

The ECG R peak and the BCG J peak are causally linked — the electrical trigger (R) precedes the mechanical output (J) by a fixed but variable interval.

![ECG and BCG waveforms aligned in time, showing the R peak and J peak with the R-J interval annotated](/images/rj-interval.svg)

The delay between them is dominated by the **pre-ejection period (PEP)**: the time from the onset of ventricular depolarisation to the opening of the aortic valve. At rest, the R-to-J interval is typically **180–240 ms**.

This interval is not a constant:

- It **shortens** under sympathetic activation (exercise, stress, caffeine) as the heart contracts more forcefully and the aortic valve opens sooner.
- It **lengthens** during parasympathetic dominance (deep sleep, relaxation) as the ventricle builds pressure more slowly.
- It **oscillates** with the respiratory cycle — intrathoracic pressure changes modulate venous return and stroke volume, shifting R-to-J by 10–20 ms per breath.

This variability is physiological information, not noise. A pipeline that treats the R-to-J delay as fixed will lose beat sync every time the subject changes posture or enters a new sleep stage. A pipeline that tracks it adaptively — updating the expected delay with each beat — stays locked all night.

---

## Why this matters

The ECG is precise and well-understood, but it requires electrodes on skin. The BCG is noisier and harder to interpret, but it requires nothing — just a sensor beneath the mattress and a body that breathes.

The trade-off is worth it for overnight monitoring. During sleep, motion is minimal, signal quality is at its best, and the physiological signals encoded in the BCG — heart rate, HRV, respiratory rate, sleep stage proxies — are exactly what you want.

Understanding the waveform anatomy above is the starting point. Beat detection, HRV extraction, sleep staging, and signal quality assessment all depend on being able to reliably identify the J peak and relate it back to the underlying cardiac physiology that the BCG is actually measuring.
