var APP_DATA = {
  "scenes": [
    {
      "id": "0-entrada",
      "name": "ENTRADA",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        },
        {
          "tileSize": 512,
          "size": 1024
        }
      ],
      "faceSize": 1024,
      "initialViewParameters": {
        "yaw": 0.08150779829173338,
        "pitch": -0.05851513441202627,
        "fov": 1.4628963779807613
      },
      "linkHotspots": [
        {
          "yaw": 0.0789482009513236,
          "pitch": 0.05162099520920549,
          "rotation": 0,
          "target": "1-corredor"
        }
      ],
      "infoHotspots": []
    },
    {
      "id": "1-corredor",
      "name": "CORREDOR",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        },
        {
          "tileSize": 512,
          "size": 1024
        }
      ],
      "faceSize": 1024,
      "initialViewParameters": {
        "yaw": -0.13828566685388388,
        "pitch": 0.00836766618633078,
        "fov": 1.4628963779807613
      },
      "linkHotspots": [
        {
          "yaw": 2.3948566477085365,
          "pitch": 0.015384107129818858,
          "rotation": 0,
          "target": "0-entrada"
        },
        {
          "yaw": -0.32073549696871595,
          "pitch": 0.06744022966727314,
          "rotation": 0,
          "target": "2-sala"
        },
        {
          "yaw": 0.8505266066592263,
          "pitch": 0.07385086249068706,
          "rotation": 0,
          "target": "3-entrada-cocina"
        },
        {
          "yaw": -1.2195544493747406,
          "pitch": 0.02591870355209558,
          "rotation": 0,
          "target": "6-escaleras"
        }
      ],
      "infoHotspots": []
    },
    {
      "id": "2-sala",
      "name": "SALA",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        },
        {
          "tileSize": 512,
          "size": 1024
        }
      ],
      "faceSize": 1024,
      "initialViewParameters": {
        "yaw": 0.2937956425514958,
        "pitch": 0.014670880581467927,
        "fov": 1.4628963779807613
      },
      "linkHotspots": [
        {
          "yaw": 0.3944135085174363,
          "pitch": 0.13595260037032375,
          "rotation": 0,
          "target": "1-corredor"
        },
        {
          "yaw": 1.0539675456885753,
          "pitch": 0.19820253740174465,
          "rotation": 0,
          "target": "6-escaleras"
        },
        {
          "yaw": -0.30405344049349736,
          "pitch": 0.1317382868286323,
          "rotation": 0,
          "target": "3-entrada-cocina"
        }
      ],
      "infoHotspots": []
    },
    {
      "id": "3-entrada-cocina",
      "name": "ENTRADA COCINA",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        },
        {
          "tileSize": 512,
          "size": 1024
        }
      ],
      "faceSize": 1024,
      "initialViewParameters": {
        "yaw": -2.5855478000549414,
        "pitch": 0.14378182891962865,
        "fov": 1.4628963779807613
      },
      "linkHotspots": [
        {
          "yaw": -1.0914127589654345,
          "pitch": 0.1551196916698494,
          "rotation": 0,
          "target": "1-corredor"
        },
        {
          "yaw": 0.2671194041263263,
          "pitch": 0.12537574101834537,
          "rotation": 0,
          "target": "2-sala"
        },
        {
          "yaw": -2.5855473405722424,
          "pitch": 0.17720152666593947,
          "rotation": 0,
          "target": "4-cocina"
        },
        {
          "yaw": -0.5414349658791817,
          "pitch": -0.12048768678587685,
          "rotation": 0,
          "target": "6-escaleras"
        }
      ],
      "infoHotspots": []
    },
    {
      "id": "4-cocina",
      "name": "COCINA",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        },
        {
          "tileSize": 512,
          "size": 1024
        }
      ],
      "faceSize": 1024,
      "initialViewParameters": {
        "pitch": 0,
        "yaw": 0,
        "fov": 1.5707963267948966
      },
      "linkHotspots": [
        {
          "yaw": 0.05138914647565862,
          "pitch": 0.15038701488841788,
          "rotation": 0,
          "target": "3-entrada-cocina"
        }
      ],
      "infoHotspots": []
    },
    {
      "id": "5-bao-auxiliar",
      "name": "BAÑO AUXILIAR",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        },
        {
          "tileSize": 512,
          "size": 1024
        }
      ],
      "faceSize": 1024,
      "initialViewParameters": {
        "pitch": 0,
        "yaw": 0,
        "fov": 1.5707963267948966
      },
      "linkHotspots": [
        {
          "yaw": -0.9516575415866892,
          "pitch": 0.2111506170058668,
          "rotation": 0,
          "target": "1-corredor"
        }
      ],
      "infoHotspots": []
    },
    {
      "id": "6-escaleras",
      "name": "ESCALERAS",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        },
        {
          "tileSize": 512,
          "size": 1024
        }
      ],
      "faceSize": 1024,
      "initialViewParameters": {
        "pitch": 0,
        "yaw": 0,
        "fov": 1.5707963267948966
      },
      "linkHotspots": [
        {
          "yaw": -0.15225706148897267,
          "pitch": 0.5501800682650142,
          "rotation": 0,
          "target": "2-sala"
        },
        {
          "yaw": 1.1219059684331683,
          "pitch": 0.15635253320351516,
          "rotation": 0,
          "target": "7-cuarto"
        },
        {
          "yaw": 1.9106242527498907,
          "pitch": 0.18311974293503042,
          "rotation": 0,
          "target": "8-bao-cuarto"
        }
      ],
      "infoHotspots": []
    },
    {
      "id": "7-cuarto",
      "name": "CUARTO",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        },
        {
          "tileSize": 512,
          "size": 1024
        }
      ],
      "faceSize": 1024,
      "initialViewParameters": {
        "pitch": 0,
        "yaw": 0,
        "fov": 1.5707963267948966
      },
      "linkHotspots": [
        {
          "yaw": 1.2391401153918906,
          "pitch": 0.10917675158741957,
          "rotation": 0,
          "target": "6-escaleras"
        },
        {
          "yaw": 2.580312972225677,
          "pitch": 0.15554518324107747,
          "rotation": 0,
          "target": "2-sala"
        }
      ],
      "infoHotspots": []
    },
    {
      "id": "8-bao-cuarto",
      "name": "BAÑO CUARTO",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        },
        {
          "tileSize": 512,
          "size": 1024
        }
      ],
      "faceSize": 1024,
      "initialViewParameters": {
        "pitch": 0,
        "yaw": 0,
        "fov": 1.5707963267948966
      },
      "linkHotspots": [
        {
          "yaw": 2.739765312917939,
          "pitch": 0.64090592706604,
          "rotation": 0,
          "target": "6-escaleras"
        }
      ],
      "infoHotspots": []
    }
  ],
  "name": "Project Title",
  "settings": {
    "mouseViewMode": "drag",
    "autorotateEnabled": false,
    "fullscreenButton": false,
    "viewControlButtons": false
  }
};
