import ShareableContentShow from './show';

interface ShareableContent {
    id: number;
    title: string;
    image_path: string | null;
    content: string | null;
    created_at: string;
}

interface PublicShowProps {
    contentItem: ShareableContent;
}

export default function PublicShow({ contentItem }: PublicShowProps) {
    return <ShareableContentShow contentItem={contentItem} isPublic={true} />;
}
