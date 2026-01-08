import { ReactNode } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp, faEdit, faSave, faTimes } from '@fortawesome/free-solid-svg-icons';

interface ProfileSectionProps {
  title: string;
  description: string;
  isExpanded: boolean;
  isEditing: boolean;
  isSaving: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  editContent: ReactNode;
  displayContent: ReactNode;
  hasProfile: boolean;
  saveButtonText: string;
  cancelButtonText: string;
  editButtonText: string;
  savingText: string;
}

export default function ProfileSection({
  title,
  description,
  isExpanded,
  isEditing,
  isSaving,
  onToggle,
  onEdit,
  onSave,
  onCancel,
  editContent,
  displayContent,
  hasProfile,
  saveButtonText,
  cancelButtonText,
  editButtonText,
  savingText,
}: ProfileSectionProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg mb-6 overflow-hidden">
      <div
        className="flex justify-between items-center p-6 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => !isEditing && onToggle()}
      >
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900">
            {title}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {description}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {!isEditing && hasProfile && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm"
            >
              <FontAwesomeIcon icon={faEdit} className="mr-2" />
              {editButtonText}
            </button>
          )}
          {!isEditing && (
            <FontAwesomeIcon
              icon={isExpanded ? faChevronUp : faChevronDown}
              className="text-gray-400"
            />
          )}
        </div>
      </div>

      {(isExpanded || isEditing) && (
        <div className="px-6 pb-6 border-t">
          {isEditing || !hasProfile ? (
            <div className="space-y-4 mt-6">
              {editContent}

              <div className="flex gap-4 pt-4">
                <button
                  onClick={onSave}
                  disabled={isSaving}
                  className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
                >
                  <FontAwesomeIcon icon={faSave} className="mr-2" />
                  {isSaving ? savingText : saveButtonText}
                </button>
                {hasProfile && (
                  <button
                    onClick={onCancel}
                    disabled={isSaving}
                    className="flex-1 bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    <FontAwesomeIcon icon={faTimes} className="mr-2" />
                    {cancelButtonText}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="mt-6">
              {displayContent}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
