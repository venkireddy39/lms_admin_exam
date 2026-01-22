import { useState, useEffect, useCallback } from "react";
import { courseService } from "../services/courseService";
import { topicService } from "../services/topicService";

/* ================= MAPPERS ================= */

const mapTopicToChapter = (topic) => ({
    id: topic.topicId,
    title: topic.topicName, // ✅ chapter name
    contents: [],
});

const mapContentToItem = (content) => {
    let type = content.contentType?.toLowerCase();
    if (type === "text") type = "heading";

    return {
        id: content.contentId,
        type,
        title: content.contentTitle,
        data: {
            url: content.fileUrl ?? null,          // 🔥 THIS MUST BE fileUrl
            description: content.contentDescription ?? "",
            isPreview: content.isPreview ?? false, // ✅ Map backend isPreview flag
        },
    };
};

/* ================= HOOK ================= */

export const useCourseBuilder = (courseId) => {
    const resolvedCourseId = Number(courseId);

    const [courseData, setCourseData] = useState({
        title: "Loading...",
        chapters: [],
    });

    const [activeChapterId, setActiveChapterId] = useState(null);

    const loadCourse = useCallback(async () => {
        if (!resolvedCourseId) return;

        const course = await courseService.getCourseById(resolvedCourseId);
        const topics = await topicService.getTopics(resolvedCourseId);

        const chapters = [];

        for (const topic of topics) {
            const chapter = mapTopicToChapter(topic);
            const contents = await topicService.getContents(topic.topicId);
            chapter.contents = contents.map(mapContentToItem);
            chapters.push(chapter);
        }

        setCourseData({
            title: course.courseName,
            chapters,
        });

        if (!activeChapterId && chapters.length > 0) {
            setActiveChapterId(chapters[0].id);
        }
    }, [resolvedCourseId, activeChapterId]);

    useEffect(() => {
        loadCourse();
    }, [loadCourse]);

    /* ---------- CHAPTER ---------- */

    const addChapter = async () => {
        await topicService.createTopic(resolvedCourseId, {
            title: "New Chapter",
            description: "",
        });
        await loadCourse();
    };

    const updateChapterTitle = async (chapterId, newTitle) => {
        await topicService.updateTopic(chapterId, {
            title: newTitle,
            description: "",
        });
        await loadCourse();
    };

    const deleteChapter = async (chapterId) => {
        await topicService.deleteTopic(chapterId);
        await loadCourse();
    };

    /* ---------- CONTENT ---------- */

    const addContent = async (chapterId, type, data) => {
        // 1️⃣ Create metadata
        let created = await topicService.createContent(chapterId, {
            type,
            title: data.title,
            description: data.description,
            url: data.url, // ✅ Pass URL if method was 'url'
        });

        // 2️⃣ Upload file
        if (data.file) {
            await topicService.uploadContentFile(created.contentId, data.file);
        }

        // 3️⃣ HARD reload from backend (SOURCE OF TRUTH)
        await loadCourse();   // 🔥 REQUIRED
    };

    const updateContent = async (chapterId, contentId, data) => {
        // 1️⃣ Metadata Update (including strict description & isPreview)
        await topicService.updateContent(contentId, {
            title: data.title,
            description: data.description,
            order: data.order,
            isPreview: data.isPreview, // ✅ Pass Preview Flag
            url: data.url, // ✅ Pass URL for external links
        });

        // 2️⃣ File Upload (if provided during edit)
        if (data.file) {
            await topicService.uploadContentFile(contentId, data.file);
        }

        // 3️⃣ Reload to reflect changes
        await loadCourse();
    };

    const deleteContent = async (chapterId, contentId) => {
        await topicService.deleteContent(contentId);
        await loadCourse();
    };

    return {
        courseData,
        activeChapterId,
        setActiveChapterId,
        selectChapter: setActiveChapterId, // ✅ Alias for UI
        addChapter,
        updateChapterTitle,
        deleteChapter,
        addContent,
        updateContent,
        deleteContent,
    };
};
