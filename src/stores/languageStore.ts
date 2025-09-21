import { defineStore } from 'pinia';
import { lang_names, LangFile } from '../scripts/lang_file';
import { reactive, ref } from 'vue';

export const useLanguageFileStore = defineStore('languageFile', () => {
    const _langFiles = reactive<LangFile[]>([]);
    const _selectedLangFile = ref<LangFile | null>(null);

    /**
     * Gets a unique id for a language file.
     * @param languageFile The language file to check.
     * @returns The language file's id if unique, otherwise a new id.
     */
    function getUniqueId(languageFile: LangFile): string {
        let needs_changing = !languageFile.id || _langFiles.find(lang_file => lang_file.id == languageFile.id && lang_file.uuid != languageFile.uuid);
        if (!needs_changing) return languageFile.id;

        let i = 1;
        let id = lang_names[0]?.key;
        while (_langFiles.find(lf => lf != languageFile && lf.id == id) && i < 2000) {
            id = lang_names[i]?.key || 'end';
            i++;
        }
        return id;
    }

    function getAllLanguageFiles() {
        return _langFiles
    }

    function addLanguageFile(languageFile: LangFile) {
        _langFiles.push(languageFile)
    }

    function getSelectedLanguageFile() {
        return _selectedLangFile.value
    }

    function selectLanguageFile(languageFile: LangFile | null) {
        _selectedLangFile.value = languageFile
    }

    return { addLanguageFile, selectLanguageFile, getAllLanguageFiles, getSelectedLanguageFile, getUniqueId }
});