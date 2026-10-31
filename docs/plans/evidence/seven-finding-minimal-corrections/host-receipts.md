# Host receipts: seven-finding corrections

All commands ran in normal local PowerShell outside the managed sandbox on
2026-10-30, on planning HEAD `79bcb814d57c3b8016c1c1315684c1eb158e2a59`.
Node 24.18.0, pnpm 11.15.1, uv 0.11.29, Cargo 1.97.1. Python 3.12.10.
Raw original receipts, input manifests and logs remain ignored under
`tmp/evidence/seven-finding-minimal-corrections/`. These digests identify
original captures; they do not turn failed or superseded runs into acceptance.

| ID | Exit | Receipt SHA-256 | Input manifest SHA-256 | Output SHA-256 |
| --- | --- | --- | --- | --- |
| format-browser-r2 | 0 | `ec06ae7e4ddae96199559be8c220d313d67599611c8b4821832af9f0b14af7e7` | `c86c635e14ad9b9fdf8cc8236cfadea9db4cd1e616eb5e366accfe69e93216c9` | `ed8d9ba48166cbf2f78965b508ceda53f671de9161c291cbbed9f3085e9e4b6e` |
| format-owned-r2 | 0 | `1d5083e1f423c2210fb54fb1817600b6237635ccab3f4697e87f92701572cd3d` | `f0124703cd509b09961a34f2260008269af0b4b09f0eff8161769d511500efd3` | `8c4e60510eb4c793a716e40071aa3ab4084a4928ebda4cc47d2dc9db1009e20d` |
| format-owned | 0 | `1c945ba1a180e34779cfe756c8bb8568fd3d2604d7aee51fe4a616926f7230f6` | `d0849a5efed47e11031de7ac2630b431f3354b33d89a03864a0f70dc58c08ec3` | `94e22bf550ccfc2c7fa2479f86229785527620e593e328da3ed2234ceea2d0f7` |
| format-python | 0 | `b28f186817eab6e615299fadab8f9c9033e5c877ea92196aaff8f55cb816f3a5` | `7e7a0dd6648ea0a9c9d53d1207baa187e3251b5d78a0308cf2e81c1eda8182d5` | `6d203e0ccd3937f8faab76ea8be422f8dd0cae98330d2e9412d3a5e9ff76363b` |
| format-r3 | 0 | `f1fed252e618e18b90629480750d93c449a406f2245fcdcabf39c50b319e3d57` | `95d7c65aa4e3992d5d8a27f5b3ff572d6c550b2e87bd985e836a84a973b54669` | `d0b9683e606390445bc0cb60a5b7bcfd33fd7714f1bad0d44482a01347b7c0b4` |
| format-runner | 0 | `8cd7a4de9c34de27653e92c32190c816e507b3e0ef9d05277654e9a3b023818f` | `16d977c7f560f8b5849e6d66d2f2de58f2f1e56090d70064ca2b4499c3b00dc3` | `d828833e6a51aae6d6ff59bab9c5763bfb75498f3b1a55a37fe2dd198855546e` |
| format-rust-r2 | 0 | `45fb68072c27a72a7d69673cf035bcc474dac7137f0522265086e494e0a2c21f` | `b107820a82c7c6f7902e74d4b850a827a6b754889ea4b32bec00d2246307cecb` | `ABSENT` |
| format-rust-r3 | 0 | `1f0bde32d342af350eb9c58e382245c84726e9e00a368d50cd99b0afc29edb6c` | `bad81b46fedb8db0ec4b1516729bf3f444ac10dc77f80f9eea474bc4dcfe35bf` | `ABSENT` |
| format-rust | 0 | `67b26f5272229cceb92e2968a89caf4d0b3b48adf2cefacd7b8b86cfbf9f3697` | `7e7a0dd6648ea0a9c9d53d1207baa187e3251b5d78a0308cf2e81c1eda8182d5` | `ABSENT` |
| G0-packages | 0 | `d3e09551e610cbfc0b7c29f069b33673e102fea8e07a164a823ad48ff901ef49` | `406bd90832245f2ffc9475b1b945d85f6b7959d3ce341bd6ba28ec230b82d28e` | `d8e4c9e1d3cc6790061f5930d44ec4d4580e2eb930c27cc48e44e1be28e9c0f9` |
| G0-piper-check | 0 | `2583aafbf9d293c2fa75787fb10bd95a271e550cea6efc5855d63dd3d08b280b` | `e341e8ae16f8daa713d95e25e89302e2489a810a7300a97b966148f8c907d26a` | `8a4ccc29a2679e8bcf3845f0e20407a22b29f8326422f59181ff10e0eba9b77f` |
| G1-desktop | 1 | `58e1d0cc082ab64266c37513940e763e0ee6879b4ac9df051045fa505ed1f1b8` | `a55903426c3038d426f763826ab2804bbb22ae4b4c7e45ce0207f85bd346277b` | `02db2799905aa5b6239779788e34f27c744329b99385d8a4c95804f9b9644b4a` |
| G1-desktop-ticker-fixed | 1 | `897e11f1a6e1eb21a97d414dfee7af28cb05de82eba03ea142d7c5d6a7193e6d` | `10014383667db3497f9f54165378a42671aea38c46b978533f5186eaa5d917f4` | `7b2fe6804ab5ea5cf0cd02a9f72dfc0098c7d59ccd71b8cb9173900d8e75ec65` |
| G1-desktop-ticker | 1 | `c906d0ee7e4099f74bd0d3575d8346cde0f3aee27d383710fa83fba52c2767ef` | `1c1d4aca9c7e2a9ed732ffb90d3a3a8be316a1701ed2f7f49f960f9d7214f7d2` | `158d019e8e031f00c2be740d1e2bc9dde634a2870d9be86d6f6a2372bccb92e3` |
| G1-epub-bounded | 1 | `cdbaa33d5993584c82f3c1ed7395a5e573c0ba09882dd1476e01494ccdd83579` | `a955c3d13e703008a376b62ba3b052e48646064f7b2bc08c2da1830f8b30945a` | `0b57c2a7ba8f71dc83ccd0091d8957b0fb6bd60ba1dd4b74e2db15b57d226bb7` |
| G1-epub-fixture | 1 | `622a2361ba6dfb77f5f9c788743a3eb71a2b14da0501c6b21d20d5378d4abea3` | `aceb5d3c3fc25aa7723e2b1fc14e3a6cdcf2d0f22a35e93798fc8f9e3c7a99d7` | `4eba8fc2650c1d68b114449bef41f9ae3f919161e800cd8e02fb0fa56ff042e1` |
| G1-epub | 1 | `c493c241b69fbf3f0aae093bbc0070e4edf68ded911161a8672ce6f66921cccf` | `ecde1f4e28ea6dc5702f0797c3112102fa04d8c8ebc8819927c9fd632a01c988` | `f6c2918734d59a8acb4ed41333b46715a5d18dc366ce61baf44c27686058055d` |
| G1-native-body-locked | 101 | `d4f920037587c3a4e9f6820aae9ddc40638a47732b47feaccfc1631961c5b84d` | `c4b989f7fc08ad9ff208b0590ff69faad872410269c8e89572dbe41b9a6db344` | `3fe5216f1b7c589d60165896087e8a812183e90c194eaf6426d5f4a2ea7b641c` |
| G1-native-body | 101 | `17a0eba3268cf0680553ea8132c453909d7eecba2d2525f344ac901623b99845` | `c4b989f7fc08ad9ff208b0590ff69faad872410269c8e89572dbe41b9a6db344` | `0ea23b70636f07490a51a8b32480a85924b5908bb3eef3e726caa7231076ec05` |
| G1-native-default | 101 | `ee5871c44c3bffcd25aed516aee01f81c5b9ba5170885f2ee06d8683a7d455a7` | `deab482fdd775d434e042b5c16a4b26650b12d999b42332dec5f073da4a0d240` | `4184ac6a6b1c004fed94085bca78f657d670b3703246619d982afcb189884a3a` |
| G1-native-locked | 101 | `092f58b9d0c5c7bffc58fa95c8030995222634beaf033a0105e841ca3e9232e3` | `deab482fdd775d434e042b5c16a4b26650b12d999b42332dec5f073da4a0d240` | `6e5188c8427ee1b57e9175205888c34bdf20b4d575c8eb605635d03b1acfda63` |
| G1-python-owner | 1 | `3e041792282f0c2de08af9349ae62cc4e61324f0f9c2cf4bf4c573c8270b29c9` | `a55903426c3038d426f763826ab2804bbb22ae4b4c7e45ce0207f85bd346277b` | `a9fec0d4862b43bf62ea88562bc2631b28eed199d9c2659f0796c5160ecb22d8` |
| G1-python | 1 | `b24a01732aac761b2a9ab3a0cfdb479327adbf0ce12a048addcede870ce2f96c` | `fa005588a260c1214007ab895cbfc468a8f33dad2263de724061ab10cef757c0` | `ecd8a974531d1d1c63a57d2461c866d03170eceee155cbf0f2ebe8ac89ad3613` |
| G10-pre-review | 0 | `4a87ee257623823a60aeb289a839bc1dfe0b3fd0095e9a2516c46f293871683e` | `408628642dbef5a444e90b394c98a073e5229b1bec1724304a54632249776d78` | `cf797cedd61884b5c0b3f7994c70392edd39ab0d4e505cb94acf6319f395427b` |
| G2-python | 0 | `96d29606ceb90aad2caf09f12eec2d3595c190e31d12a88455e6e9965f00039f` | `e341e8ae16f8daa713d95e25e89302e2489a810a7300a97b966148f8c907d26a` | `afde2a417d1a13af678ba463191a57abe7ae8684818b856cdea8c2c4132b5524` |
| G2-rust-final | 0 | `e593bd5af038374834146f0154b9c9bcd670ec9979f95a48d38c05f5b76be335` | `c86c635e14ad9b9fdf8cc8236cfadea9db4cd1e616eb5e366accfe69e93216c9` | `ac122c7a467baae8d6f124726bc0bcd77db4a65d422cdbb05cfd3d19cb04762d` |
| G2-rust-lint-r2 | 0 | `8ed6493b630af797bb8ef3c0f8f1b27375908fe67c5f1af52d9c5a984cf5ea5c` | `e341e8ae16f8daa713d95e25e89302e2489a810a7300a97b966148f8c907d26a` | `f41b3a58d762f231b1819da22f21da2b7d6b639d8b593114add78754c1cbdc68` |
| G2-rust-lint | 101 | `aa23a6c709c0eb342c2dc45fc93afb4cdb047ccdd75d85c80256a0aa0d887bff` | `406bd90832245f2ffc9475b1b945d85f6b7959d3ce341bd6ba28ec230b82d28e` | `465c73bda23147a8e370a30adca5965234cfbb71202728c0bd2ab8e9d634d269` |
| G2-ts-expanded | 0 | `252d9408b199a3d8b33cd31c9ec2ac0297d54505fd38bea28da52033975aef42` | `0c72777eec8cc60b2e2d1208d6106cf620c41997fe1c7a574afaabd2774abc25` | `a83c993fd0c174da879452983407699d2a4429b9fa7a4dc04dd442d95e6fe679` |
| G2-ts-final-r2 | 2 | `2ae35b8379daaaa4da87a9b581dcf07a9e57f911f66fb683ef890c486e1a5b7a` | `46cb12646b3a4134cea1f9d6522875fb5e878be13ecea7fdddcbc9ed7084b9af` | `89e3d50dee930d98fd0569bae911404fa35c335a3ff3339409b80d69f47c0d8b` |
| G2-ts-final-r3 | 1 | `b8305e44d5cf231f6567d84153de326746af7993e187fe2987ac0c6f27a157fe` | `6873dcb5d62f60df16f1459e00ee064f9e8dd580dc3d9c93e5e0ddcbe31ea8b7` | `e2617e71eba31a9804cc1f3f4057c95a71ed0d889c337efefb9dbb5e1c9d698e` |
| G2-ts-final-r4 | 0 | `a12e727f2ee393adecff1851e2e68de89b1849f0dd1e0ed412fca2f8b8734b7c` | `6873dcb5d62f60df16f1459e00ee064f9e8dd580dc3d9c93e5e0ddcbe31ea8b7` | `f635cd0221d94188e20d6a60b9b28a0478132d501bf965ac7eb7757041790214` |
| G2-typescript | 0 | `91849f0e6ae4c8498b53a49a2a093e3469fd7a963926b170afe7f37bd6639dce` | `e341e8ae16f8daa713d95e25e89302e2489a810a7300a97b966148f8c907d26a` | `91d3df787757118285a6f2cad8aa4b987f075055f1bea8f0740ecd97cb5cd025` |
| G3-epub | 0 | `2ea35a0d2df9e38578fd0c8a872e55ebfdafc356c9df546be027c642b0c8ca6b` | `406bd90832245f2ffc9475b1b945d85f6b7959d3ce341bd6ba28ec230b82d28e` | `44fbab920c6073a8ebf81e574a2106c1548b888163df8176472cf3b0539be4a8` |
| G3-expanded | 0 | `8544f7f9336c73a1173a268222353375cb277330398179629d262963deb59749` | `7fa0de342578e6598fc8464d038723755c351fb42afcfb98f16c08bbd51b7a04` | `51ea11c6db1d13e981e6cbdf79ecd8b8d1c65510874dc4d0be2714009748ba0e` |
| G4-desktop | 1 | `d6ae9d41ea06481b292840ef7559dde5d70ce002a3f92f55a787dad9081c91d2` | `406bd90832245f2ffc9475b1b945d85f6b7959d3ce341bd6ba28ec230b82d28e` | `64bd657a4d559e97c7507084b93c454b11404e3fd9fea221e2b90f6272f507fd` |
| G4-final | 0 | `daba37f71e1adcf9c42c5b8d0422663811106d5f45c4ddf8b70d9eac5b3ab73f` | `be6852c134966ae569d9e60b7a66dc7d699e84ae5c1ef0a5f059cd98950a400f` | `f4507153c5bfd1569e937d38f3e190b2f492df3407de0b531e663602f41769ae` |
| G4-reader-r2 | 1 | `c9215bd870632367c7b44f983bf1cf8f253674f32abe14fb9cc30279c9a06078` | `e341e8ae16f8daa713d95e25e89302e2489a810a7300a97b966148f8c907d26a` | `c50908b733716c28a6e72d69c965002582fb02b9ad85f6230bfc48b20700025a` |
| G4-reader-r3 | 0 | `64e7f0235c35b89aa20fbe71008731a79c36cc2b4e325c308abff8bcd4c518bf` | `c86c635e14ad9b9fdf8cc8236cfadea9db4cd1e616eb5e366accfe69e93216c9` | `00057ec64e0d018ee44ac20864aac089903f384ec4cc7605b1b4e0eca1f2797f` |
| G5-python | 0 | `0cda1f8416a288c8da634aab27d05b0c8b69dadfe4fa7faf9b1e608bb25e902f` | `406bd90832245f2ffc9475b1b945d85f6b7959d3ce341bd6ba28ec230b82d28e` | `28ead417cc7146974d7a6d52c97ecf637deeb69da2f19b711675cce3950484dc` |
| G6-optional-default-r2 | 0 | `655ceabe37f63af7c3d98748fa6e43a274371c6031548447780d30d76bad61d4` | `c86c635e14ad9b9fdf8cc8236cfadea9db4cd1e616eb5e366accfe69e93216c9` | `322bf23b5df440193ee0bc02b5e3d8a3bee0270bca4a6d883271a58de35a45e1` |
| G6-optional-default | 101 | `8060aacc93cb47eb03812eed33036cee6bf8d50543494aa0ed9c90e017b54a1f` | `e341e8ae16f8daa713d95e25e89302e2489a810a7300a97b966148f8c907d26a` | `5e8e332b493238fcb2178a1c5ac9ff3d3db55347c53fa2d0745f2ee5638dc2a9` |
| G6-optional-locked-r2 | 0 | `93e1c70f7ee1de4d88141e68b8ef2797889144ed9e8c63aeb1d3063917836230` | `c86c635e14ad9b9fdf8cc8236cfadea9db4cd1e616eb5e366accfe69e93216c9` | `01607f1e9744f4bb9f17321c9ba56470b5a38ed35df1db8eaedcd79f443a908f` |
| G6-optional-locked | 101 | `020f10f98989fe29fafbdc2003d3763e1991d931e5b87a20ec3b5e1d9cac4f55` | `e341e8ae16f8daa713d95e25e89302e2489a810a7300a97b966148f8c907d26a` | `2ebb4bcf701269815e9290b1339e04d6dd39a3497768d4ae0ef2150d38fd14cd` |
| G6-supervisor-default-r2 | 0 | `29a40efa0599762b5b76b88a7a075a9e005a5d74524f7d85519fa765ea2786c1` | `c86c635e14ad9b9fdf8cc8236cfadea9db4cd1e616eb5e366accfe69e93216c9` | `ef11795b42f6be98acc9a16ec7f7a74af8b7011aad036a6f101664c98fed5b07` |
| G6-supervisor-default | 0 | `8e0b7f0d2bfb4890cce4d56cb53c4c9b37bae1f6267f986e71ef4212685d5953` | `e341e8ae16f8daa713d95e25e89302e2489a810a7300a97b966148f8c907d26a` | `03340cbab2d97c21f32a92c7e915b57327f72e3ee9f3185ca584208250f883fc` |
| G6-supervisor-locked-r2 | 0 | `0afa907ed153df2479cf3491a6794cb6237490c455751885d21c79d0c338f007` | `c86c635e14ad9b9fdf8cc8236cfadea9db4cd1e616eb5e366accfe69e93216c9` | `07412bf1ba77a03f5efe28f4c80933637d97068487402a444b255c06f1239ab1` |
| G6-supervisor-locked | 0 | `a1180d2fd35f6fd1ee8f92ce9e772a072203bf51303d38fc73c4cfeabf737deb` | `e341e8ae16f8daa713d95e25e89302e2489a810a7300a97b966148f8c907d26a` | `94a62af6b54122c2443d4577e9369a60f862ee7450803d614808150f6ef27a2e` |
| G7-browser | 0 | `c6ec1bb9bdd6d83d6957a0719035d52f8c47ac22bb18960ed5c7ab614382f063` | `af1980df9a5fc0c1f0edd2995c7f6f47cb67caaf5f38da4ef873545758c3da79` | `65af9b725665603c3efd1f5a1ae95c8e7c02f9b16865fe6f8e773926748614ac` |
| G7-native | 0 | `284e0d479797498b0fd32c50f0595a36d56aa1cb0b446cac1cea128ff0e5eabe` | `0c72777eec8cc60b2e2d1208d6106cf620c41997fe1c7a574afaabd2774abc25` | `1411bc65e503d26550d2fe8d721c55902d35991cf20917f5a2cd737376019c28` |
| G8-corrected-resources | 0 | `3a0996669d257346899c4f0cc78c62d467ad7f6334f04e82e7f5f8a01819c8af` | `8a05d6260968ce467df2023f831d8e71494030a23dbcf4afc98a969783e63ca8` | `054e341b975a920956d69356475e1cd8343c3674732aa4f595c21ee90dcc49da` |
| G8-diagnostic | 1 | `9315fc4cb99635336f47d5935b1f39619933028dc79ae44d4eb7a1fe4f79d54c` | `57b7664964503c8543fac53fba4491b21d7ea0a50bcfc25024f4c59b91eae9d5` | `5340b8899151c2d827b68aa10dcfb29276d4f74a01c34e5e68d3cf603be9c84d` |
| G8-piper | 1 | `bd0c1d810e5b70af1aa255c2c64bc95d43b8a2099e8c1a2d5a24502cad6bb6c3` | `0c72777eec8cc60b2e2d1208d6106cf620c41997fe1c7a574afaabd2774abc25` | `39791a8b76817842338c3d7a213e0aa543c59bd0f3914a480c1fd7efae67270a` |
| G8-runner | 0 | `1ab8c950150cae9a415e3d96cacf7be9dd4502e92145d0af4b3172d828bf30ad` | `6c1d3ead05b71ec540aa15f0e83829085f0243a0f7b2e46a116114b218f41f71` | `a3ab59a1bd29150dc80df54eda94b5a408c536caac1e675ee52ec740b07116f3` |
| G9-chatterbox | 0 | `789fbb8e9de79e7ac61e69fea8e22f86062d0975d5aa929a50383b333a6a132d` | `be6852c134966ae569d9e60b7a66dc7d699e84ae5c1ef0a5f059cd98950a400f` | `ffa9ef67dbee37d6c0e33db2d782e6b48df963ffd425938ec97ba5d0d239ee98` |
| R1-format | 0 | `361acf4e9d49927e86e47eceb27e040fbab9859ccaab1f4df6a7db51dba9e8b0` | `82fd4a6b95af23e983072b5b5fa62e1e023e7a89c5a6701fa8efabead29a050e` | `55f4dd5b3aa461183554a91924d901a6cf2cda58a79e34959b542e546ee3cb44` |
| R1-G10 | 0 | `4be4b2d703655a44b2331fc1b5c4e0dc50974c6fb7e08ea6a65bb96ca0cc0774` | `2910141403d86bd7ad2c35a3f69af7dbfa6ce2b62a6993b25efb2e104c0bfae3` | `1620df158ea0ae11dbd6e2de7da6b0846a5c467f8575bfd7fbc4a1288a60005b` |
| R1-G2 | 0 | `a4009a0d263ec9668ebe4f313c4e8c1a1f056da89609e89231834f38e6b11422` | `c93a094a8ab1dc48c74d101c6197971851a4ebd9f2fcbdddfede5dec4aef3f33` | `081b4ed455bd7fa1d7ceb60078793309c45342ee3da35e579883205255c577d4` |
| R1-G3 | 0 | `dba9c264b4e27510f86e4bf48449926b3a5d8ae8f38ca1bc95e8af0e8851cdd7` | `21ba5b47673f79b5b0fefe27a07d3ec333ba201f06567885dcb3ee9a19de0ee6` | `63bbb91a01a1c8f5c6ce2b621331d29edfa50cfe1afa9aaf3c40aac9e28a2dc2` |
| R1-G4 | 0 | `16697592297ac56dd32a1f2a03994bbbaef4463dd77425e32e9fedb8fc6d7475` | `21ba5b47673f79b5b0fefe27a07d3ec333ba201f06567885dcb3ee9a19de0ee6` | `35eba9a397607ee41c5d4356cb86615c563bd4f2cf3685effa9fa3c1cead55be` |
| R1-G7-browser | 0 | `7ee38bb485028520c19a62b5ed2f1ff2057a1f3b80a0d4c8136fea5aa11b26ca` | `79f7fdaddd6dc67c8be1e5ae812a3a42f0320055239b58f9f705b4a90026d1f1` | `0db88b506a2a7cf5ba2fe06241962b251365d716c336b7ec3f63b2861acdb92e` |
| R1-G7-native | 0 | `94ceccaf663b68a15e8bbaf84200981f675d8871200e23dfc47972c00d4271b9` | `79f7fdaddd6dc67c8be1e5ae812a3a42f0320055239b58f9f705b4a90026d1f1` | `68eaba42ab2c7b37cb2fd867e920b37235ed1a40d2f006dd6b80d8ee654a50e6` |
| R1-G8 | 0 | `8ce6f811b5daa8bebde4fa6f6214b79b255924dbe07505f8bcf6aa9ff7cd1d6a` | `2910141403d86bd7ad2c35a3f69af7dbfa6ce2b62a6993b25efb2e104c0bfae3` | `9d564fb1cb9747fa12e35ce48423966c5428c05a0ff91550ed7b7e5af6795123` |
| R1-red-boundary | 1 | `9d46cecc9d0c3f80689b42edccddd8f52c0181465dcb4a35422fe09f1b0ca4c9` | `7726742fa8e506dac15a732c5abb79142e3639e5498d805a2a5568b478444142` | `f7dd1c1ccef45c447b7794ecfe47089e52e4ac1bc1bb7c0e1d2cf1d60b4eff47` |
| R1-red | 0 | `c3946dc86c3663f1c3e96d94c25b6f159b06e04b3a7f2bc09e589806b4d7f6fc` | `adfcc059aa22232454062dc500333a1858ae7163b0c96591f41b2c41a9ec8591` | `26076eb46d62937351c692d6995a2d51a32c49ccaf22652f917e3efee7e2d7fa` |

## Original command strings

### format-browser-r2

UTC: 2026-10-30T16:57:23.1208369Z through 2026-10-30T16:57:23.7381056Z. Exit 0.

```powershell
pnpm.cmd exec prettier --write apps/desktop/tests/browser/reader-reflow-restoration.smoke.spec.ts
```

### format-owned-r2

UTC: 2026-10-30T16:53:07.5143352Z through 2026-10-30T16:53:08.2436001Z. Exit 0.

```powershell
pnpm.cmd exec prettier --write apps/desktop/src/reader/ReaderPublication.test.tsx apps/desktop/tests/browser/reader-reflow-restoration.smoke.spec.ts
```

### format-owned

UTC: 2026-10-30T16:50:24.2319819Z through 2026-10-30T16:50:25.6927643Z. Exit 0.

```powershell
pnpm.cmd exec prettier --write apps/desktop/src/persistence/reader-position-save-coordinator.ts apps/desktop/src/persistence/reader-position-save-coordinator.test.ts apps/desktop/src/reader/ReaderPublication.tsx apps/desktop/src/reader/ReaderPublication.test.tsx apps/desktop/src/tts/product-narration-coordinator.ts apps/desktop/src/tts/product-narration-coordinator.test.ts packages/epub/src/narration/narration-quotation-context.ts packages/epub/src/narration/narration-preparation.ts packages/epub/src/narration/narration-prepared-segment.ts packages/epub/src/narration/narration-normalizer.ts packages/epub/src/narration/narration-bilingual-normalizer.ts packages/epub/src/narration/narration-resource-bounds.test.ts packages/epub/src/integration/narration-preparation-matrix.test.ts
```

### format-python

UTC: 2026-10-30T16:50:28.9388685Z through 2026-10-30T16:50:29.4359214Z. Exit 0.

```powershell
uv run --project services/tts --locked ruff format services/tts/benchmarks/isolation.py services/tts/tests/test_benchmark_isolation.py
```

### format-r3

UTC: 2026-10-30T16:55:57.5961414Z through 2026-10-30T16:55:58.2971603Z. Exit 0.

```powershell
pnpm.cmd exec prettier --write apps/desktop/src/reader/ReaderPublication.tsx apps/desktop/src/reader/ReaderPublication.test.tsx
```

### format-runner

UTC: 2026-10-30T17:10:33.4499287Z through 2026-10-30T17:10:34.0934185Z. Exit 0.

```powershell
pnpm.cmd exec prettier --write apps/desktop/scripts/native-smoke/tts-scenarios.mjs apps/desktop/scripts/native-smoke.node-test.mjs
```

### format-rust-r2

UTC: 2026-10-30T16:53:09.5393665Z through 2026-10-30T16:53:09.8133279Z. Exit 0.

```powershell
cargo fmt --manifest-path apps/desktop/src-tauri/Cargo.toml
```

### format-rust-r3

UTC: 2026-10-30T16:55:59.5645343Z through 2026-10-30T16:55:59.8478726Z. Exit 0.

```powershell
cargo fmt --manifest-path apps/desktop/src-tauri/Cargo.toml
```

### format-rust

UTC: 2026-10-30T16:50:30.8118827Z through 2026-10-30T16:50:31.1609657Z. Exit 0.

```powershell
cargo fmt --manifest-path apps/desktop/src-tauri/Cargo.toml
```

### G0-packages

UTC: 2026-10-30T16:50:49.5777271Z through 2026-10-30T16:50:52.1344768Z. Exit 0.

```powershell
pnpm.cmd build:packages
```

### G0-piper-check

UTC: 2026-10-30T16:53:54.5456956Z through 2026-10-30T16:54:16.8826522Z. Exit 0.

```powershell
pnpm.cmd package:piper-core:check
```

### G1-desktop

UTC: 2026-10-30T16:36:36.4733043Z through 2026-10-30T16:36:58.8939463Z. Exit 1.

```powershell
pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/product-narration-coordinator.test.ts src/tts/operational-recovery.test.ts src/reader/ReaderPublication.test.tsx src/reader/reader-reflow-restoration.test.ts src/reader/segment-highlight-controller.test.tsx src/persistence/reader-position-save-coordinator.test.ts src/persistence/narration-position-save-bridge.test.ts -t R7-
```

### G1-desktop-ticker-fixed

UTC: 2026-10-30T16:38:04.1327927Z through 2026-10-30T16:38:06.1130210Z. Exit 1.

```powershell
pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/product-narration-coordinator.test.ts -t R7-
```

### G1-desktop-ticker

UTC: 2026-10-30T16:37:36.0775739Z through 2026-10-30T16:37:37.9707267Z. Exit 1.

```powershell
pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/product-narration-coordinator.test.ts -t R7-
```

### G1-epub-bounded

UTC: 2026-10-30T16:41:08.1410627Z through 2026-10-30T16:41:29.3727877Z. Exit 1.

```powershell
pnpm.cmd --filter @voxleaf/epub exec vitest run src/integration/narration-preparation-matrix.test.ts -t R7-
```

### G1-epub-fixture

UTC: 2026-10-30T16:42:39.6173903Z through 2026-10-30T16:42:51.6539121Z. Exit 1.

```powershell
pnpm.cmd --filter @voxleaf/epub exec vitest run src/integration/narration-preparation-matrix.test.ts -t R7-
```

### G1-epub

UTC: 2026-10-30T16:40:17.7660905Z through 2026-10-30T16:40:44.3386827Z. Exit 1.

```powershell
pnpm.cmd --filter @voxleaf/epub exec vitest run src/narration/narration-normalizer.test.ts src/narration/narration-boundary-scanner.test.ts src/narration/narration-prepared-segment.test.ts src/narration/narration-resource-bounds.test.ts src/integration/narration-preparation-matrix.test.ts src/resource/opened-publication.test.ts -t R7-
```

### G1-native-body-locked

UTC: 2026-10-30T16:46:59.4345430Z through 2026-10-30T16:47:08.1270788Z. Exit 101.

```powershell
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml r7_02_cancellation_settles_stalled_body --features release-locked-runtime
```

### G1-native-body

UTC: 2026-10-30T16:46:32.2396374Z through 2026-10-30T16:46:41.6793569Z. Exit 101.

```powershell
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml r7_02_cancellation_settles_stalled_body
```

### G1-native-default

UTC: 2026-10-30T16:44:18.5358817Z through 2026-10-30T16:44:45.1444297Z. Exit 101.

```powershell
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml r7_
```

### G1-native-locked

UTC: 2026-10-30T16:45:36.8199192Z through 2026-10-30T16:45:47.7326314Z. Exit 101.

```powershell
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml r7_ --features release-locked-runtime
```

### G1-python-owner

UTC: 2026-10-30T16:36:32.0128053Z through 2026-10-30T16:36:32.9877560Z. Exit 1.

```powershell
uv run --project services/tts --locked pytest services/tts/tests/test_benchmark_isolation.py services/tts/tests/test_benchmark_dual_worker_runtime.py -k r7_
```

### G1-python

UTC: 2026-10-30T16:35:17.0124788Z through 2026-10-30T16:35:18.6269309Z. Exit 1.

```powershell
uv run --project services/tts --locked pytest services/tts/tests/test_benchmark_isolation.py services/tts/tests/test_benchmark_dual_worker_runtime.py -k r7_
```

### G10-pre-review

UTC: 2026-10-30T17:17:59.1532159Z through 2026-10-30T17:18:00.6427057Z. Exit 0.

```powershell
pnpm.cmd check:evidence; if ($LASTEXITCODE) { throw "evidence" }; git diff --check; if ($LASTEXITCODE) { throw "whitespace" }; python tmp/evidence/seven-finding-minimal-corrections/check-links.py
```

### G2-python

UTC: 2026-10-30T16:53:13.5452868Z through 2026-10-30T16:53:15.8829205Z. Exit 0.

```powershell
pnpm.cmd format:check:python; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }; pnpm.cmd lint:python; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }; pnpm.cmd typecheck:python
```

### G2-rust-final

UTC: 2026-10-30T16:56:35.2050541Z through 2026-10-30T16:56:41.1668268Z. Exit 0.

```powershell
pnpm.cmd format:check:rust; if ($LASTEXITCODE -ne 0) { throw "rust-format-failed" }; pnpm.cmd lint:rust
```

### G2-rust-lint-r2

UTC: 2026-10-30T16:53:15.1617459Z through 2026-10-30T16:53:22.3912754Z. Exit 0.

```powershell
pnpm.cmd lint:rust
```

### G2-rust-lint

UTC: 2026-10-30T16:50:49.5642629Z through 2026-10-30T16:50:56.2818561Z. Exit 101.

```powershell
pnpm.cmd lint:rust
```

### G2-ts-expanded

UTC: 2026-10-30T17:05:13.3661320Z through 2026-10-30T17:05:32.7175365Z. Exit 0.

```powershell
pnpm.cmd format:check:typescript; if ($LASTEXITCODE) { throw "format" }; pnpm.cmd lint:typescript; if ($LASTEXITCODE) { throw "lint" }; pnpm.cmd --filter @voxleaf/epub typecheck; if ($LASTEXITCODE) { throw "epub types" }; pnpm.cmd --filter @voxleaf/desktop typecheck
```

### G2-ts-final-r2

UTC: 2026-10-30T16:58:00.6647266Z through 2026-10-30T16:58:16.9015192Z. Exit 2.

```powershell
pnpm.cmd format:check:typescript; if ($LASTEXITCODE -ne 0) { throw "typescript-format-failed" }; pnpm.cmd lint:typescript; if ($LASTEXITCODE -ne 0) { throw "typescript-lint-failed" }; pnpm.cmd --filter @voxleaf/desktop typecheck
```

### G2-ts-final-r3

UTC: 2026-10-30T17:02:11.4654043Z through 2026-10-30T17:02:18.2638602Z. Exit 1.

```powershell
pnpm.cmd format:check:typescript; if ($LASTEXITCODE) { throw "format" }; pnpm.cmd lint:typescript; if ($LASTEXITCODE) { throw "lint" }; pnpm.cmd --filter @voxleaf/desktop typecheck
```

### G2-ts-final-r4

UTC: 2026-10-30T17:02:28.7578619Z through 2026-10-30T17:02:45.1287104Z. Exit 0.

```powershell
pnpm.cmd exec prettier --write apps/desktop/src/reader/ReaderPublication.test.tsx; if ($LASTEXITCODE) { throw "format write" }; pnpm.cmd format:check:typescript; if ($LASTEXITCODE) { throw "format" }; pnpm.cmd lint:typescript; if ($LASTEXITCODE) { throw "lint" }; pnpm.cmd --filter @voxleaf/desktop typecheck
```

### G2-typescript

UTC: 2026-10-30T16:53:19.0552247Z through 2026-10-30T16:53:52.8394624Z. Exit 0.

```powershell
pnpm.cmd lint:typescript; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }; pnpm.cmd --filter @voxleaf/epub typecheck; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }; pnpm.cmd --filter @voxleaf/desktop typecheck
```

### G3-epub

UTC: 2026-10-30T16:51:13.9801683Z through 2026-10-30T16:51:31.5948627Z. Exit 0.

```powershell
pnpm.cmd --filter @voxleaf/epub exec vitest run src/narration/narration-normalizer.test.ts src/narration/narration-boundary-scanner.test.ts src/narration/narration-prepared-segment.test.ts src/narration/narration-resource-bounds.test.ts src/integration/narration-preparation-matrix.test.ts src/resource/opened-publication.test.ts
```

### G3-expanded

UTC: 2026-10-30T17:03:54.0877984Z through 2026-10-30T17:04:40.2586364Z. Exit 0.

```powershell
pnpm.cmd exec prettier --write packages/epub/src/integration/narration-preparation-matrix.test.ts; if ($LASTEXITCODE) { throw "format" }; pnpm.cmd --filter @voxleaf/epub typecheck; if ($LASTEXITCODE) { throw "typecheck" }; pnpm.cmd --filter @voxleaf/epub exec vitest run src/narration/narration-normalizer.test.ts src/narration/narration-boundary-scanner.test.ts src/narration/narration-prepared-segment.test.ts src/narration/narration-resource-bounds.test.ts src/integration/narration-preparation-matrix.test.ts src/resource/opened-publication.test.ts
```

### G4-desktop

UTC: 2026-10-30T16:51:15.3225186Z through 2026-10-30T16:51:19.8490411Z. Exit 1.

```powershell
pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/product-narration-coordinator.test.ts src/tts/operational-recovery.test.ts src/reader/ReaderPublication.test.tsx src/reader/reader-reflow-restoration.test.ts src/reader/segment-highlight-controller.test.tsx src/persistence/reader-position-save-coordinator.test.ts src/persistence/narration-position-save-bridge.test.ts
```

### G4-final

UTC: 2026-10-30T17:07:47.0361928Z through 2026-10-30T17:07:51.0005184Z. Exit 0.

```powershell
pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/product-narration-coordinator.test.ts src/tts/operational-recovery.test.ts src/reader/ReaderPublication.test.tsx src/reader/reader-reflow-restoration.test.ts src/reader/segment-highlight-controller.test.tsx src/persistence/reader-position-save-coordinator.test.ts src/persistence/narration-position-save-bridge.test.ts
```

### G4-reader-r2

UTC: 2026-10-30T16:53:54.2732046Z through 2026-10-30T16:53:56.8339716Z. Exit 1.

```powershell
pnpm.cmd --filter @voxleaf/desktop exec vitest run src/reader/ReaderPublication.test.tsx
```

### G4-reader-r3

UTC: 2026-10-30T16:56:03.4703241Z through 2026-10-30T16:56:05.7023745Z. Exit 0.

```powershell
pnpm.cmd --filter @voxleaf/desktop exec vitest run src/reader/ReaderPublication.test.tsx
```

### G5-python

UTC: 2026-10-30T16:50:48.2020048Z through 2026-10-30T16:50:52.8384433Z. Exit 0.

```powershell
uv run --project services/tts --locked pytest services/tts/tests/test_benchmark_isolation.py services/tts/tests/test_benchmark_dual_worker_runtime.py
```

### G6-optional-default-r2

UTC: 2026-10-30T16:56:42.6388778Z through 2026-10-30T16:56:50.5377667Z. Exit 0.

```powershell
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml tts_optional_chatterbox::tests::
```

### G6-optional-default

UTC: 2026-10-30T16:53:52.9768499Z through 2026-10-30T16:54:03.8003641Z. Exit 101.

```powershell
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml tts_optional_chatterbox::tests::
```

### G6-optional-locked-r2

UTC: 2026-10-30T16:56:57.4594442Z through 2026-10-30T16:57:04.8656836Z. Exit 0.

```powershell
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml tts_optional_chatterbox::tests:: --features release-locked-runtime
```

### G6-optional-locked

UTC: 2026-10-30T16:54:11.6559899Z through 2026-10-30T16:54:22.8830332Z. Exit 101.

```powershell
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml tts_optional_chatterbox::tests:: --features release-locked-runtime
```

### G6-supervisor-default-r2

UTC: 2026-10-30T16:56:51.7184721Z through 2026-10-30T16:56:56.1004066Z. Exit 0.

```powershell
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml tts_service_supervisor::tests::
```

### G6-supervisor-default

UTC: 2026-10-30T16:54:05.3245044Z through 2026-10-30T16:54:10.2594122Z. Exit 0.

```powershell
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml tts_service_supervisor::tests::
```

### G6-supervisor-locked-r2

UTC: 2026-10-30T16:57:06.0686070Z through 2026-10-30T16:57:10.2923416Z. Exit 0.

```powershell
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml tts_service_supervisor::tests:: --features release-locked-runtime
```

### G6-supervisor-locked

UTC: 2026-10-30T16:54:24.1941485Z through 2026-10-30T16:54:28.4262076Z. Exit 0.

```powershell
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml tts_service_supervisor::tests:: --features release-locked-runtime
```

### G7-browser

UTC: 2026-10-30T17:02:53.3317234Z through 2026-10-30T17:03:05.7004541Z. Exit 0.

```powershell
pnpm.cmd test:browser reader-reflow-restoration.smoke.spec.ts --grep "R7-04|preserves one canonical passage"
```

### G7-native

UTC: 2026-10-30T17:04:31.7692303Z through 2026-10-30T17:05:20.5078847Z. Exit 0.

```powershell
& ./tmp/evidence/seven-finding-minimal-corrections/native-acceptance.ps1
```

### G8-corrected-resources

UTC: 2026-10-30T17:15:45.5842056Z through 2026-10-30T17:18:37.9060376Z. Exit 0.

```powershell
& ./tmp/evidence/seven-finding-minimal-corrections/piper-corrected-resources.ps1
```

### G8-diagnostic

UTC: 2026-10-30T17:11:54.4747841Z through 2026-10-30T17:13:31.0971530Z. Exit 1.

```powershell
& ./tmp/evidence/seven-finding-minimal-corrections/piper-acceptance.ps1
```

### G8-piper

UTC: 2026-10-30T17:05:37.4652752Z through 2026-10-30T17:07:12.9165092Z. Exit 1.

```powershell
& ./tmp/evidence/seven-finding-minimal-corrections/piper-acceptance.ps1
```

### G8-runner

UTC: 2026-10-30T17:10:42.9282455Z through 2026-10-30T17:11:23.4025557Z. Exit 0.

```powershell
node --test apps/desktop/scripts/native-smoke.node-test.mjs; if ($LASTEXITCODE) { throw "node harness" }; pnpm.cmd format:check:typescript; if ($LASTEXITCODE) { throw "format" }; pnpm.cmd lint:typescript
```

### G9-chatterbox

UTC: 2026-10-30T17:08:02.5914545Z through 2026-10-30T17:11:56.2733978Z. Exit 0.

```powershell
& ./tmp/evidence/seven-finding-minimal-corrections/chatterbox-acceptance.ps1
```

### R1-format

UTC: 2026-10-30T17:27:26.0378178Z through 2026-10-30T17:27:26.8823003Z. Exit 0.

```powershell
pnpm.cmd exec prettier --write packages/epub/src/narration/narration-normalizer.ts packages/epub/src/narration/narration-bilingual-normalizer.ts packages/epub/src/narration/narration-quotation-context.ts packages/epub/src/narration/narration-preparation.ts packages/epub/src/narration/narration-resource-bounds.test.ts packages/epub/src/integration/narration-preparation-matrix.test.ts
```

### R1-G10

UTC: 2026-10-30T17:30:39.2046396Z through 2026-10-30T17:30:40.0505033Z. Exit 0.

```powershell
pnpm.cmd check:evidence; if ($LASTEXITCODE) { throw "evidence" }; git diff --check; if ($LASTEXITCODE) { throw "whitespace" }; python tmp/evidence/seven-finding-minimal-corrections/check-links.py
```

### R1-G2

UTC: 2026-10-30T17:28:20.3820621Z through 2026-10-30T17:28:41.2811073Z. Exit 0.

```powershell
pnpm.cmd format:check:typescript; if ($LASTEXITCODE) { throw "format" }; pnpm.cmd lint:typescript; if ($LASTEXITCODE) { throw "lint" }; pnpm.cmd --filter @voxleaf/epub typecheck; if ($LASTEXITCODE) { throw "epub types" }; pnpm.cmd build:packages; if ($LASTEXITCODE) { throw "exports" }; pnpm.cmd --filter @voxleaf/desktop typecheck
```

### R1-G3

UTC: 2026-10-30T17:28:52.1633414Z through 2026-10-30T17:29:36.2335435Z. Exit 0.

```powershell
pnpm.cmd --filter @voxleaf/epub exec vitest run src/narration/narration-normalizer.test.ts src/narration/narration-boundary-scanner.test.ts src/narration/narration-prepared-segment.test.ts src/narration/narration-resource-bounds.test.ts src/integration/narration-preparation-matrix.test.ts src/resource/opened-publication.test.ts
```

### R1-G4

UTC: 2026-10-30T17:29:03.7588036Z through 2026-10-30T17:29:08.8641197Z. Exit 0.

```powershell
pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/product-narration-coordinator.test.ts src/tts/operational-recovery.test.ts src/reader/ReaderPublication.test.tsx src/reader/reader-reflow-restoration.test.ts src/reader/segment-highlight-controller.test.tsx src/persistence/reader-position-save-coordinator.test.ts src/persistence/narration-position-save-bridge.test.ts
```

### R1-G7-browser

UTC: 2026-10-30T17:29:43.9434993Z through 2026-10-30T17:29:54.4570830Z. Exit 0.

```powershell
pnpm.cmd test:browser reader-reflow-restoration.smoke.spec.ts --grep "R7-04|preserves one canonical passage"
```

### R1-G7-native

UTC: 2026-10-30T17:30:11.3159943Z through 2026-10-30T17:31:03.8205535Z. Exit 0.

```powershell
& ./tmp/evidence/seven-finding-minimal-corrections/native-acceptance.ps1
```

### R1-G8

UTC: 2026-10-30T17:31:45.7724964Z through 2026-10-30T17:34:35.3270272Z. Exit 0.

```powershell
& ./tmp/evidence/seven-finding-minimal-corrections/R1-piper-corrected-resources.ps1
```

### R1-red-boundary

UTC: 2026-10-30T17:26:40.3356763Z through 2026-10-30T17:26:41.8180062Z. Exit 1.

```powershell
pnpm.cmd --filter @voxleaf/epub exec vitest run src/integration/narration-preparation-matrix.test.ts -t R7-R1
```

### R1-red

UTC: 2026-10-30T17:24:59.2342304Z through 2026-10-30T17:25:00.6586683Z. Exit 0.

```powershell
pnpm.cmd --filter @voxleaf/epub exec vitest run src/integration/narration-preparation-matrix.test.ts -t R7-R1
```

## Capture limitations

`G2-ts-final` has its original input manifest and failure log but no result JSON:
the first wrapper version let a terminating scriptblock error exit before receipt
serialization. The exit-1 host tool response and format failure are retained;
no substitute historical result receipt was fabricated. The wrapper was corrected
before subsequent captures. Formatting actions inside G2-ts-final-r4 and
G3-expanded precede their checks; the latter test file is also independently
snapshotted at its final bytes during G7-native and G2-ts-expanded.
No source writer ran concurrently against a tested production owner.
