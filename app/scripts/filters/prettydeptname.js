'use strict';

angular.module('fiveStarApp')
.filter('prettyDeptName', function () {
    var names = {
        All: 'All Depts.',
        Appliances: 'Appliances',
        MobileApps: 'Apps for Android',
        ArtsAndCrafts: 'Arts & Crafts',
        Automotive: 'Automotive',
        Baby: 'Baby',
        Beauty: 'Beauty',
        Books: 'Books',
        WirelessAccessories: 'Mobile & Acc.',
        Apparel: 'Clothing & Acc.',
        Collectibles: 'Collectibles',
        PCHardware: 'Computers',
        Electronics: 'Electronics',
        Grocery: 'Grocery & Food',
        HealthPersonalCare: 'Health & Personal Care',
        HomeGarden: 'Home & Garden',
        Industrial: 'Industrial & Sci.',
        Jewelry: 'Jewelry',
        KindleStore: 'Kindle Store',
        Kitchen: 'Kitchen',
        Magazines: 'Magazine Subscriptions',
        Miscellaneous: 'Miscellaneous',
        DigitalMusic: 'MP3 Music',
        Music: 'Music',
        MusicalInstruments: 'Musical Instruments',
        OfficeProducts: 'Office Products',
        OutdoorLiving: 'Outdoor Living',
        LawnGarden: 'Patio, Lawn & Garden',
        PetSupplies: 'Pet Supplies',
        Shoes: 'Shoes',
        Software: 'Software',
        SportingGoods: 'Sports & Outdoors',
        Tools: 'Tools & Home',
        Toys: 'Toys & Games',
        VideoGames: 'Video Games',
        Watches: 'Watches'
    };
    return function (input) {
        return names[input] || input;
    };
});
