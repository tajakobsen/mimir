// WARNING: This file was automatically generated by "no.item.xp.codegen". You may lose your changes if you edit it.
export interface Footer {
  /**
   * Footer Menypunkter
   */
  footerContentId?: string;

  /**
   * Lenke Copyright
   */
  copyrightUrl: string;

  /**
   * Bunn lenker
   */
  globalLinks?: Array<{
    /**
     * Lenketittel
     */
    linkTitle: string;

    /**
     * Lenkemål
     */
    urlSrc?:
      | {
          /**
           * Selected
           */
          _selected: "manual";

          /**
           * Url lenke
           */
          manual: {
            /**
             * Kildelenke
             */
            url?: string;
          };
        }
      | {
          /**
           * Selected
           */
          _selected: "content";

          /**
           * Lenke til internt innhold
           */
          content: {
            /**
             * Relatert innhold
             */
            contentId?: string;
          };
        };
  }>;

  /**
   * Lenke Facebook
   */
  facebookUrl: string;

  /**
   * Lenke Twitter
   */
  twitterUrl: string;

  /**
   * Lenke Linkedin
   */
  linkedinUrl: string;

  /**
   * Lenke RSS
   */
  rssUrl: string;
}
