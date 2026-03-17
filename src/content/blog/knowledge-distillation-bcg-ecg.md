---
title: "Knowledge distillation: teaching a BCG model with ECG labels"
excerpt: "When your teacher model is 85% accurate and your student input is noisier, you use that gap intentionally."
date: "2026-02-12"
dateDisplay: "Feb 12, 2026"
readTime: 8
category: ai
tag: "AI / ML"
featured: false
---

## Why distillation and not just supervised training?

The naive approach to building a BCG-based heart rate model is to label BCG beats manually and train on those labels. The problem: manual BCG annotation is slow, noisy, and expensive. ECG annotation is cheap — automated R-peak detectors like Pan-Tompkins run in real-time with >99% accuracy.

Knowledge distillation lets you use ECG as a high-quality teacher to label BCG segments, then train a student model that runs on BCG alone — no ECG required at inference time.

## The teacher: ECG-based HRV model

Our teacher is a simple 1D CNN trained on the SHHS dataset with ECG-derived RR intervals as ground truth. It achieves 85% accuracy on 4-class sleep staging (Wake, REM, Light, Deep) at 30-second epoch resolution. Crucially, the teacher outputs **soft labels** — probability distributions over the four classes — not hard one-hot vectors.

These soft labels carry more information than hard labels. A prediction of [0.6, 0.25, 0.1, 0.05] tells the student something a hard label of [1, 0, 0, 0] does not: the boundary between Wake and REM is uncertain here.

## The student: BCG input, ECG supervision

The student model takes 30-second BCG windows as input. During training, it minimises a combined loss:

`L = α × CE(student_logits, hard_labels) + (1-α) × T² × KL(softmax(student_logits/T), softmax(teacher_logits/T))`

Where T is the temperature parameter (we used T=4) applied to the **logits** before softmax — not to the softmax outputs. The T² factor (from Hinton 2015) compensates for the reduced gradient magnitude that results from the softer distributions, keeping the two loss terms in balance. Omitting T² causes the distillation term to be underweighted by a factor of 1/T². α=0.3 gave us the best validation performance — mostly learning from the teacher, with a small anchor to ground truth.

## Results on held-out nights

Without distillation, BCG-only sleep staging hit 71% accuracy. With distillation from the ECG teacher, it reached 79% — a meaningful jump that closes most of the gap to ECG-based staging without requiring any ECG at test time. The biggest gains were in REM detection, where BCG's HRV signature is distinctive but the raw signal is often ambiguous.

## What the gap tells you

The remaining 6% accuracy gap between teacher and student isn't a model capacity problem — it's a signal quality problem. BCG is fundamentally noisier than ECG. The distillation framework makes this explicit: you can quantify exactly how much information is lost in the BCG sensor compared to ECG, and design your SQI to flag the segments where that gap is largest.
