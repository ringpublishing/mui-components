const BASE_IMAGE_PATH = 'https://design.ringpublishing.com/images/';

export enum ImageSize {
    SMALL = 'small',
    MEDIUM = 'medium',
    LARGE = 'large',
}

const ImageFileSizeSuffixes: Record<ImageSize, string> = {
    [ImageSize.SMALL]: '_small',
    [ImageSize.MEDIUM]: '_medium',
    [ImageSize.LARGE]: '_large',
};

export enum TestImage {
    ANIMAL = 'animal.jpg',
    APARTMENT = 'apartment.jpg',
    BEACH = 'beach.jpg',
    BIRD = 'bird.jpg',
    BIRD_2 = 'bird-2.jpg',
    BIRD_3 = 'bird-3.jpg',
    BIRD_4 = 'bird-4.jpg',
    BIRD_5 = 'bird-5.jpg',
    BOAT = 'boat.jpg',
    BUILDING = 'building.jpg',
    CAMERA = 'camera.jpg',
    CAR = 'car.jpg',
    CAR_2 = 'car-2.jpg',
    CAR_4 = 'car-4.jpg',
    CASTLE = 'castle.jpg',
    CHRISTMAS_TREE = 'christmas-tree.jpg',
    CRAB = 'crab.jpg',
    DAN = 'dan.jpg',
    DANIAL = 'danial.jpg',
    DESERT = 'desert.jpg',
    DOG = 'dog.jpg',
    EAGLE = 'eagle.jpg',
    FARM = 'farm.jpg',
    FOREST = 'forest.jpg',
    FOREST_2 = 'forest-2.jpg',
    ISLAND = 'island.jpg',
    JELLYFISH = 'jellyfish.jpg',
    KITCHEN = 'kitchen.jpg',
    LANDSCAPE = 'landscape.jpg',
    LANDSCAPE_2 = 'landscape-2.jpg',
    LANDSCAPE_3 = 'landscape-3.jpg',
    LIVING_ROOM = 'living-room.jpg',
    MOOSE = 'moose.jpg',
    MOUNTAINS = 'mountains.jpg',
    MOUNTAINS_2 = 'mountains-2.jpg',
    NEONS = 'neons.jpg',
    ORCHARD = 'orchard.jpg',
    PEOPLE = 'people.jpg',
    PEOPLE_2 = 'people-2.jpg',
    PEOPLE_3 = 'people-3.jpg',
    PERSON = 'person.jpg',
    PILLOWS = 'pillows.jpg',
    PUB = 'pub.jpg',
    RIVER = 'river.jpg',
    SEA = 'sea.jpg',
    STAIRS = 'stairs.jpg',
    STREET = 'street.jpg',
    STREET_2 = 'street-2.jpg',
    STREET_3 = 'street-3.jpg',
    TEXTURE = 'texture.jpg',
    TREE = 'tree.jpg',
    TREE_2 = 'tree-2.jpg',
    TREE_3 = 'tree-3.jpg',
}

export function getImagePath(imageFile: TestImage, size: ImageSize = ImageSize.SMALL): string {
    const [baseName, extension] = imageFile.split('.');
    const fileName = `${baseName}${ImageFileSizeSuffixes[size]}.${extension}`;

    return `${BASE_IMAGE_PATH}${fileName}`;
}

export function getRandomImage(): TestImage {
    const images = Object.values(TestImage);
    const randomIndex = Math.floor(Math.random() * images.length);

    return images[randomIndex];
}

export function getRandomImageSize(): ImageSize {
    const sizes = Object.values(ImageSize);
    const randomIndex = Math.floor(Math.random() * sizes.length);

    return sizes[randomIndex];
}
