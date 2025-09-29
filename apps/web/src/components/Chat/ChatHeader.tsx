import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeftIcon, 
  InformationCircleIcon, 
  PhoneIcon, 
  VideoCameraIcon,
  EllipsisVerticalIcon 
} from '@heroicons/react/24/outline';
import { User, Pet } from '../../types';

interface ChatHeaderProps {
  otherUser: User;
  otherPet: Pet;
  currentUserPet: Pet;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  otherUser,
  otherPet,
  currentUserPet,
}) => {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between"
    >
      <div className="flex items-center space-x-3">
        <button
          onClick={() => router.push('/matches')}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
        </button>

        {/* Other user and pet info */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-r from-pink-400 to-purple-500 flex items-center justify-center text-white font-semibold">
            {otherUser.avatar ? (
              <img src={otherUser.avatar} alt={otherUser.firstName} className="w-full h-full object-cover" />
            ) : (
              <span>{otherUser.firstName[0]}</span>
            )}
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900">
              {otherUser.firstName} & {otherPet.name}
            </h3>
            <p className="text-sm text-gray-500">
              {currentUserPet.name} ↔ {otherPet.name}
            </p>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center space-x-2">
        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <PhoneIcon className="w-5 h-5 text-gray-600" />
        </button>
        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <VideoCameraIcon className="w-5 h-5 text-gray-600" />
        </button>
        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <InformationCircleIcon className="w-5 h-5 text-gray-600" />
        </button>
        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <EllipsisVerticalIcon className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    </motion.div>
  );
};

export default ChatHeader;
