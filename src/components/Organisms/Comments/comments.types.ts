import { CommonComponentProps, WithDataTestIdSuffix } from '../../../helpers/commonTypes.js';

export interface CommentProps {
    id: string | number;
    text: string;
    creationTime: string;
    author: string;
    isOwner: boolean;
    isModified?: boolean;
}

export interface CommentItemProps {
    comment: CommentProps;
}

export interface CommentsProps extends CommonComponentProps, WithDataTestIdSuffix {
    initialComments: CommentProps[];
    labels: CommentsLabels;
    minLength?: number;
    disableCreatePanel?: boolean;
    onDelete?: OnDeleteType;
    onUpdate?: OnUpdateType;
    onAdd?: OnAddType;
}

export interface CommentsLabels extends ActionsLabels {
    placeholder: string;
    editing: string;
    modified: string;
}

export interface CommentsProviderProps extends WithDataTestIdSuffix {
    children: React.ReactNode;
    initialComments?: CommentProps[];
    labels: CommentsLabels;
    minLength: number;
    onAdd?: OnAddType;
    onUpdate?: OnUpdateType;
    onDelete?: OnDeleteType;
}

export interface CommentsContextProps extends WithDataTestIdSuffix {
    comments: CommentProps[];
    labels: CommentsLabels;
    minLength: number;
    isAddModeEnabled: boolean;
    currentEditingId: CommentIdProp;
    setAddCommentMode: () => void;
    setEditingId: (commentId: CommentIdProp) => void;
    addComment: AddCommentType;
    updateComment: UpdateCommentType;
    deleteComment: DeleteCommentType;
    exitEditing: () => void;
}

export type CommentsContext = CommentsContextProps | undefined;

export type OnDeleteType = (id: CommentIdProp, api: OnDeleteApi) => Promise<void>;
export type OnUpdateType = (id: CommentIdProp, text: string, api: OnUpdateApi) => Promise<void>;
export type OnAddType = (text: string, api: OnAddApi) => Promise<void>;

export type AddCommentType = (text: string) => Promise<HandlerResponseType>;
export type UpdateCommentType = (
    commentId: CommentIdProp,
    updatedData: Partial<CommentProps>,
) => Promise<HandlerResponseType>;
export type DeleteCommentType = (commentId: CommentIdProp) => Promise<HandlerResponseType>;
export type SetEditingIdType = (commentId: CommentIdProp) => void;
export type HandleTextChangeType = (event: React.ChangeEvent<HTMLInputElement>) => void;
export type UpdateCommentByIdType = (commentId: CommentIdProp, updatedData: Partial<CommentProps>) => void;
export type HandlerResponseStatus = 'success' | 'error' | null;
export interface HandlerResponseType {
    status: HandlerResponseStatus;
    errorMessage: string;
}

export interface OnDeleteApi {
    deleteComment: () => void;
    setError: (errorMessage: string) => void;
}

export interface OnUpdateApi {
    updateComment: (updatedData: Partial<CommentProps>) => void;
    setError: (errorMessage: string) => void;
}

export interface OnAddApi {
    addComment: (comment: CommentProps) => void;
    setError: (errorMessage: string) => void;
}

export type CommentIdProp = string | number | null;

export interface CommentActionsProps {
    callbacks?: ActionCallbacks;
    isSubmitDisabled?: boolean;
    isCancelDisabled?: boolean;
    isEdit?: boolean;
    isPending?: boolean;
    dataTestId: string;
}

export interface ActionsLabels {
    cancel: string;
    add: string;
    update: string;
}

interface ActionCallbacks {
    onCancel: () => void;
    onSubmit: () => Promise<void>;
}
