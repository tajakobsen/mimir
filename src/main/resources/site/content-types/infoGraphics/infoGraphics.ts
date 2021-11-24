// WARNING: This file was automatically generated by "no.item.xp.codegen". You may lose your changes if you edit it.
export interface InfoGraphics {
  /**
   * Tittel på visualinseringen
   */
  title: string;

  /**
   * Infografikk eller visualisering
   */
  image: string;

  /**
   * Kilder
   */
  sources?: Array<
    | {
        /**
         * Selected
         */
        _selected: "urlSource";

        /**
         * Kilde fra url
         */
        urlSource: {
          /**
           * Tekst til kildelenke
           */
          urlText: string;

          /**
           * Kildelenke
           */
          url: string;
        };
      }
    | {
        /**
         * Selected
         */
        _selected: "relatedSource";

        /**
         * Kilde fra XP
         */
        relatedSource: {
          /**
           * Tekst til kildelenke
           */
          urlText?: string;

          /**
           * Relatert innhold
           */
          sourceSelector?: string;
        };
      }
  >;

  /**
   * Fotnote-tekst
   */
  footNote?: Array<string>;

  /**
   * Beskrivende hjelpetekst for blinde
   */
  longDesc?: string;

  /**
   * Tabelldata
   */
  tableData?: string;
}
