const LOCAL_ASSETS_IMAGES_PATH: string = "../assets/images/";

/**
 * Fallback pictures and Captions to be used in the home page by the carousel component.
 */
export const homePageCarouselData = {
  fallbackPictures: [
    {
      url: `${LOCAL_ASSETS_IMAGES_PATH}Carousel-01.jpg`
    },
    {
      url: `${LOCAL_ASSETS_IMAGES_PATH}Carousel-02.jpg`
    },
    {
      url: `${LOCAL_ASSETS_IMAGES_PATH}Carousel-03.jpg`
    }
  ],
  captions: [
    {
      img: `${LOCAL_ASSETS_IMAGES_PATH}grater-white.svg`,
      text: "Buscá la receta que necesitás ..."
    },
    {
      img: `${LOCAL_ASSETS_IMAGES_PATH}kitchen-scale-white.svg`,
      text: "¿Que puedo cocinar hoy?"
    },
    {
      img: `${LOCAL_ASSETS_IMAGES_PATH}rolling-pin-white.svg`,
      text: "Sorprendé con nuevos sabores ..."
    },
    {
      img: `${LOCAL_ASSETS_IMAGES_PATH}pastry-bag-white.svg`,
      text: "Comparti con el mundo tus recetas!"
    },
    {
      img: `${LOCAL_ASSETS_IMAGES_PATH}gloves-white.svg`,
      text: "Animate a innovar en tu cocina ..."
    },
    {
      img: `${LOCAL_ASSETS_IMAGES_PATH}measuring-cup-white.svg`,
      text: "Miles de sabores a tu alcance!"
    },
    {
      img: `${LOCAL_ASSETS_IMAGES_PATH}mixer-white.svg`,
      text: "Donde tus recetas viven ..."
    },
  ]
};
