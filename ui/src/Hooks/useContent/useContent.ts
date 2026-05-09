import englishContent from 'Content/english';

// Given English is the default, the type will be based on the English content structure
export type ContentStructure = typeof englishContent;
export type ContentGroupKey = keyof ContentStructure;

const CONTENT_MISSING = 'MISSING_CONTENT';

// If a default Group key is given, then the consumer needs only to provide the content key or injections
export default function useContent<T extends ContentGroupKey>(contentGroup: T) {
  function getContent(key: keyof ContentStructure[T], injections?: (string | number)[]): string {
    /* injections is an optional array to fill content keys with variable text
     *   Example, given the following key:
     *   "MONTH_TOTAL": "{{0}} Total"
     *
     *   Each index of the injections array replaces a token like so: $<index-of-array>
     *   So $0 will be replaced with the first element of the injections array, $1 with the second, and so on.
     * */

    // Create a new string as not to mutate the original
    let contentString = `${englishContent[contentGroup][key]}`;

    // Not found
    if (!contentString) {
      return CONTENT_MISSING;
    }

    // Injections have been provided, find and replace:
    if (injections?.length) {
      injections.forEach((injectionVar, index) => {
        contentString = contentString.replace(`{{${index}}}`, String(injectionVar));
      });
    }

    return contentString;
  }

  return getContent;
}
