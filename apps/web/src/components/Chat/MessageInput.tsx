import { PaperAirplaneIcon, PaperClipIcon, FaceSmileIcon, PhotoIcon, MapPinIcon, ExclamationCircleIcon, MicrophoneIcon, CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import React, { useState, useRef, useEffect } from 'react';

import { logger } from '../../services/logger';
import LoadingSpinner from '../UI/LoadingSpinner';


import EnhancedMessageInput from './EnhancedMessageInput';

export default EnhancedMessageInput;
