/**
 * Typed Motion Components - Production Grade
 * 
 * Provides strictly typed Motion elements that work seamlessly with our motionTypes utilities.
 * No more casting - these components are properly typed from the ground up.
 */

import type { MotionProps } from 'framer-motion';
import { motion } from 'framer-motion';
import type {
    AnchorHTMLAttributes,
    ButtonHTMLAttributes,
    DetailedHTMLProps,
    FormHTMLAttributes,
    HTMLAttributes,
    ImgHTMLAttributes,
    InputHTMLAttributes,
    LabelHTMLAttributes,
    SelectHTMLAttributes,
    TextareaHTMLAttributes
} from 'react';

// === Core Motion Element Types ===

type MotionDivProps = DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> & MotionProps;
type MotionButtonProps = DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & MotionProps;
type MotionSpanProps = DetailedHTMLProps<HTMLAttributes<HTMLSpanElement>, HTMLSpanElement> & MotionProps;
type MotionH2Props = DetailedHTMLProps<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement> & MotionProps;
type MotionPProps = DetailedHTMLProps<HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement> & MotionProps;
type MotionLabelProps = DetailedHTMLProps<LabelHTMLAttributes<HTMLLabelElement>, HTMLLabelElement> & MotionProps;

// === Primary Motion Components (Properly Typed) ===

export const MotionDiv = motion.div as React.FC<MotionDivProps>;
export const MotionButton = motion.button as React.FC<MotionButtonProps>;
export const MotionSpan = motion.span as React.FC<MotionSpanProps>;
export const MotionH2 = motion.h2 as React.FC<MotionH2Props>;
export const MotionP = motion.p as React.FC<MotionPProps>;
export const MotionLabel = motion.label as React.FC<MotionLabelProps>;

// === Extended Motion Components ===

export const MotionH1 = motion.h1 as React.FC<DetailedHTMLProps<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement> & MotionProps>;
export const MotionH3 = motion.h3 as React.FC<DetailedHTMLProps<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement> & MotionProps>;
export const MotionSection = motion.section as React.FC<DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & MotionProps>;
export const MotionArticle = motion.article as React.FC<DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & MotionProps>;
export const MotionNav = motion.nav as React.FC<DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & MotionProps>;
export const MotionHeader = motion.header as React.FC<DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & MotionProps>;
export const MotionMain = motion.main as React.FC<DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & MotionProps>;
export const MotionFooter = motion.footer as React.FC<DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & MotionProps>;
export const MotionAside = motion.aside as React.FC<DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & MotionProps>;

// === List Motion Components ===

export const MotionUl = motion.ul as React.FC<DetailedHTMLProps<HTMLAttributes<HTMLUListElement>, HTMLUListElement> & MotionProps>;
export const MotionOl = motion.ol as React.FC<DetailedHTMLProps<HTMLAttributes<HTMLOListElement>, HTMLOListElement> & MotionProps>;
export const MotionLi = motion.li as React.FC<DetailedHTMLProps<HTMLAttributes<HTMLLIElement>, HTMLLIElement> & MotionProps>;

// === Form Motion Components ===

export const MotionForm = motion.form as React.FC<DetailedHTMLProps<FormHTMLAttributes<HTMLFormElement>, HTMLFormElement> & MotionProps>;
export const MotionInput = motion.input as React.FC<DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> & MotionProps>;
export const MotionTextarea = motion.textarea as React.FC<DetailedHTMLProps<TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement> & MotionProps>;
export const MotionSelect = motion.select as React.FC<DetailedHTMLProps<SelectHTMLAttributes<HTMLSelectElement>, HTMLSelectElement> & MotionProps>;

// === Media Motion Components ===

export const MotionImg = motion.img as React.FC<DetailedHTMLProps<ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement> & MotionProps>;
export const MotionA = motion.a as React.FC<DetailedHTMLProps<AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement> & MotionProps>;

// === Specialized Components ===

export const MotionDetails = motion.details as React.FC<DetailedHTMLProps<HTMLAttributes<HTMLDetailsElement>, HTMLDetailsElement> & MotionProps>;

// === Table Motion Components (for completeness) ===

export const MotionTable = motion.table as React.FC<DetailedHTMLProps<HTMLAttributes<HTMLTableElement>, HTMLTableElement> & MotionProps>;
export const MotionThead = motion.thead as React.FC<DetailedHTMLProps<HTMLAttributes<HTMLTableSectionElement>, HTMLTableSectionElement> & MotionProps>;
export const MotionTbody = motion.tbody as React.FC<DetailedHTMLProps<HTMLAttributes<HTMLTableSectionElement>, HTMLTableSectionElement> & MotionProps>;
export const MotionTr = motion.tr as React.FC<DetailedHTMLProps<HTMLAttributes<HTMLTableRowElement>, HTMLTableRowElement> & MotionProps>;
export const MotionTh = motion.th as React.FC<DetailedHTMLProps<HTMLAttributes<HTMLTableHeaderCellElement>, HTMLTableHeaderCellElement> & MotionProps>;
export const MotionTd = motion.td as React.FC<DetailedHTMLProps<HTMLAttributes<HTMLTableDataCellElement>, HTMLTableDataCellElement> & MotionProps>;
