/* Thiên Số — Dữ liệu Tướng pháp chỉ tay (Chiromancy & Chirognomy)
   Kết hợp tinh hoa Tướng thuật Á Đông (Ma Y Thần Tướng) và Khoa Tướng tay Hiện đại (Cheiro),
   giải mã tướng tay dưới góc nhìn khoa học hành vi và phát triển bản thân. */
(function () {
  'use strict';

  var PALMISTRY = {
    // 4 Hình thái bàn tay theo nguyên tố
    handTypes: {
      earth: {
        id: 'earth',
        name: 'Bàn tay Đất (Thổ)',
        element: 'Thổ',
        shape: 'Lòng bàn tay vuông, ngón tay ngắn và dày',
        traits: ['Thực tế', 'Kiên định', 'Đáng tin cậy', 'Gắn liền tự nhiên'],
        nature: 'Người mang bàn tay Đất luôn hướng tới sự vững chãi và an toàn. Bạn làm việc chăm chỉ, thích các giá trị thực tế hơn là những lời hứa hão huyền. Trong cuộc sống, bạn là chỗ dựa kiên cố cho gia đình và bè bạn.',
        strengths: ['Sức bền thể lực tốt, khả năng chịu đựng gian khổ cao', 'Kỷ luật, trung thực, giữ chữ tín hàng đầu', 'Có khiếu với công việc thủ công, kỹ thuật hoặc quản trị thực tế'],
        challenges: ['Dễ bảo thủ, ngại đổi mới hoặc tiếp nhận cái nhìn khác biệt', 'Đôi khi quá thận trọng khiến lỡ mất các cơ hội đột phá']
      },
      air: {
        id: 'air',
        name: 'Bàn tay Khí (Phong)',
        element: 'Phong',
        shape: 'Lòng bàn tay vuông, ngón tay thon dài',
        traits: ['Trí tuệ', 'Giao tiếp hoạt bát', 'Hiếu kỳ', 'Tư duy logic'],
        nature: 'Bàn tay Khí đại diện cho năng lượng của tâm trí và ngôn từ. Bạn ham học hỏi, yêu thích trao đổi ý tưởng và có khả năng phân tích sự việc rất khách quan. Bạn không thích sự đơn điệu và luôn tìm kiếm sự kích thích trí tuệ.',
        strengths: ['Khả năng ăn nói, thuyết phục và truyền tải thông điệp xuất sắc', 'Tư duy nhanh nhạy, giải quyết vấn đề bằng trí tuệ và sự thấu suốt', 'Thích nghi tốt với công nghệ và môi trường làm việc hiện đại'],
        challenges: ['Dễ suy nghĩ quá nhiều (overthinking), dễ căng thẳng thần kinh', 'Đôi khi thiếu kiên nhẫn khi đối mặt với công việc lặp đi lặp lại']
      },
      water: {
        id: 'water',
        name: 'Bàn tay Nước (Thủy)',
        element: 'Thủy',
        shape: 'Lòng bàn tay chữ nhật, ngón tay thon dài, da mềm mại',
        traits: ['Trực giác cao', 'Nhạy cảm', 'Sáng tạo', 'Giàu lòng trắc ẩn'],
        nature: 'Bàn tay Nước là hiện thân của tâm hồn nghệ sĩ và cảm xúc sâu lắng. Bạn có linh cảm cực kỳ bén nhạy, cảm nhận được nỗi đau và suy nghĩ của người khác trước khi họ nói ra. Nghệ thuật, tâm lý và chữa lành là mảnh đất màu mỡ của bạn.',
        strengths: ['Trực giác tâm linh và sự đồng cảm sâu sắc hiếm có', 'Tài năng nghệ thuật, thi ca, hội họa hoặc thấu hiểu tâm lý', 'Biết cách yêu thương, quan tâm và vun đắp các mối quan hệ'],
        challenges: ['Dễ bị cảm xúc chi phối, dễ tổn thương trước lời phán xét', 'Cần học cách thiết lập ranh giới cảm xúc để không bị kiệt quệ']
      },
      fire: {
        id: 'fire',
        name: 'Bàn tay Hỏa',
        element: 'Hỏa',
        shape: 'Lòng bàn tay chữ nhật, ngón tay ngắn và linh hoạt',
        traits: ['Nhiệt huyết', 'Lãnh đạo', 'Phiêu lưu', 'Hành động nhanh'],
        nature: 'Bàn tay Hỏa luôn rực cháy ngọn lửa của tham vọng và hành động. Bạn tràn đầy năng lượng, sẵn sàng chấp nhận rủi ro và thích dẫn đầu đoàn người. Bạn ghét sự trì trệ và luôn thúc đẩy mọi thứ tiến lên phía trước.',
        strengths: ['Ý chí mạnh mẽ, bản lĩnh dám nghĩ dám làm và truyền cảm hứng', 'Khả năng ra quyết định nhanh trong tình thế khó khăn', 'Đam mê cháy bỏng và sức hút cá nhân nổi bật'],
        challenges: ['Dễ nóng vội, cả thèm chóng chán khi mất đi sự hào hứng ban đầu', 'Cần kiểm soát cái tôi và lắng nghe ý kiến đóng góp của người khác']
      }
    },

    // 5 Đại đường chỉ tay chính
    lines: {
      life: {
        id: 'life',
        name: 'Đường Sinh Đạo (Bản Mệnh)',
        han: '生命線',
        significance: 'Thể hiện sức sống, năng lượng thể chất, sinh lực đề kháng và các bước chuyển biến lớn trong hành trình đời người (không đo lường độ dài thọ mệnh mà đo chất lượng dòng sinh khí).',
        options: {
          deep_curved: {
            id: 'deep_curved',
            label: 'Dài, sâu, uốn cong ôm rộng quanh ngón cái',
            reading: 'Sinh lực dồi dào, sức đề kháng và khả năng hồi phục cơ thể tuyệt vời. Bạn yêu đời, nhiệt huyết và có nền tảng thể chất vững vàng để theo đuổi mục tiêu lớn.',
            advice: 'Hãy phát huy nguồn năng lượng dồi dào này vào việc kiến tạo sự nghiệp và rèn luyện thể thao đều đặn.'
          },
          straight_close: {
            id: 'straight_close',
            label: 'Hơi thẳng, ôm hẹp sát gần ngón cái',
            reading: 'Thể lực ở mức vừa phải, bạn là người cẩn trọng, hướng nội và hay tiết kiệm năng lượng. Bạn thích môi trường quen thuộc, không thích mạo hiểm thể chất.',
            advice: 'Nên chú trọng nghỉ ngơi, bồi bổ giấc ngủ và tránh làm việc quá sức kéo dài.'
          },
          broken_chained: {
            id: 'broken_chained',
            label: 'Có đoạn đứt nối, hình mắt xích hoặc đảo vân',
            reading: 'Hành trình cuộc sống có những giai đoạn chuyển biến lớn về sức khỏe hoặc lối sống. Các đoạn ngắt quãng thường báo hiệu một bước ngoặt thay đổi hoàn toàn môi trường sống hoặc tư duy.',
            advice: 'Mỗi khúc quanh là một lần tái sinh. Hãy chú ý chăm sóc hệ tiêu hóa và giữ tâm lý lạc quan trước mọi biến chuyển.'
          },
          forked_end: {
            id: 'forked_end',
            label: 'Phân nhánh hình đuôi cá ở đoạn cuối cổ tay',
            reading: 'Dấu hiệu của người có duyên xuất ngoại hoặc chuyển đến định cư tại nơi xa quê hương. Tuổi xế chiều thanh nhàn, được con cháu hoặc cộng đồng yêu mến.',
            advice: 'Đừng ngại đón nhận những chuyến đi xa hay cơ hội làm việc tại những vùng đất mới.'
          },
          sister_line: {
            id: 'sister_line',
            label: 'Có đường chỉ phụ chạy song song bên trong (Đường Quý Nhân)',
            reading: 'Quý nhân tương trợ, tổ tiên che chở hoặc bạn đời đồng hành đắc lực. Ngay cả khi gặp hoạn nạn, bạn cũng thường may mắn thoát nạn trong gang tấc.',
            advice: 'Tích đức hành thiện, biết ơn những người giúp đỡ mình sẽ giúp vầng quý nhân luôn sáng tỏ.'
          }
        }
      },

      head: {
        id: 'head',
        name: 'Đường Trí Đạo (Tư Duy)',
        han: '智慧線',
        significance: 'Phản ánh phong cách tư duy, phương thức tiếp nhận tri thức, khả năng tập trung, sức tưởng tượng và cách bạn giải quyết các bài toán trong đời.',
        options: {
          long_straight: {
            id: 'long_straight',
            label: 'Dài, thẳng ngang lòng bàn tay',
            reading: 'Tư duy logic, thực tế và cực kỳ lý trí. Bạn là mẫu người xem trọng bằng chứng, giải quyết việc theo quy trình rõ ràng và giữ được cái đầu lạnh trước áp lực.',
            advice: 'Rất hợp với các lĩnh vực tài chính, kỹ thuật, nghiên cứu hoặc quản trị. Đôi khi hãy thả lỏng cảm xúc hơn.'
          },
          curved_down: {
            id: 'curved_down',
            label: 'Uốn cong mềm mại hướng xuống gò Thái Âm',
            reading: 'Óc sáng tạo phong phú, tư duy hình tượng và trực giác sắc bén. Bạn có khiếu nghệ thuật, tâm lý và nhìn thấu những điều ẩn giấu dưới bề mặt sự việc.',
            advice: 'Hợp với sáng tạo nội dung, nghệ thuật, thiết kế hoặc tư vấn tâm lý. Hãy ghi chép lại các ý tưởng bất chợt.'
          },
          forked_writer: {
            id: 'forked_writer',
            label: 'Phân nhánh đuôi cá ở cuối (Vân Nhà Văn / Doanh Nhân)',
            reading: 'Cực kỳ linh hoạt, vừa có tư duy thực tế vừa có sức sáng tạo dồi dào. Bạn có khả năng giao tiếp, thương thuyết và chuyển hóa ý tưởng thành giá trị kinh tế.',
            advice: 'Đây là nét tướng quý của người làm ngoại giao, khởi nghiệp hoặc sáng tác. Hãy tự tin triển khai các dự án độc lập.'
          },
          short_direct: {
            id: 'short_direct',
            label: 'Ngắn, kết thúc dưới ngón giữa hoặc áp út',
            reading: 'Người hành động trực diện, không thích sự vòng vo hay lý thuyết suông. Bạn quyết định nhanh chóng và thích bắt tay vào làm ngay hơn là bàn bạc kéo dài.',
            advice: 'Hành động nhanh là lợi thế lớn, nhưng hãy dành vài phút cân nhắc kỹ hậu quả dài hạn trước khi chốt quyết định lớn.'
          },
          wavy_broken: {
            id: 'wavy_broken',
            label: 'Lượn sóng hoặc có gián đoạn',
            reading: 'Tư duy đa chiều, thích tìm tòi nhiều lĩnh vực cùng lúc. Đôi khi thiếu sự tập trung liên tục vào một việc duy nhất.',
            advice: 'Thực hành thiền định hoặc kỹ thuật Pomodoro sẽ giúp gom tụ tâm trí và nâng cao hiệu suất vượt bậc.'
          }
        }
      },

      heart: {
        id: 'heart',
        name: 'Đường Tâm Đạo (Tình Cảm)',
        han: '感情線',
        significance: 'Tiết lộ thế giới cảm xúc nội tâm, cách bạn yêu thương, kỳ vọng trong hôn nhân, thái độ trước các mối quan hệ và khả năng thấu cảm với tha nhân.',
        options: {
          curves_jupiter: {
            id: 'curves_jupiter',
            label: 'Uốn cong hướng lên gò Mộc Tinh (dưới ngón trỏ)',
            reading: 'Trái tim thủy chung, lý tưởng tình yêu cao đẹp và giàu lòng trắc ẩn. Bạn xem trọng sự chân thành, luôn bảo bọc người thương và có chuẩn mực đạo đức trong sáng.',
            advice: 'Tình cảm sâu sắc là món quà, nhưng đừng lý tưởng hóa đối phương quá mức để tránh sự hụt hẫng không đáng có.'
          },
          between_fingers: {
            id: 'between_fingers',
            label: 'Kết thúc ở khoảng trống giữa ngón trỏ và ngón giữa',
            reading: 'Tâm lý tình cảm cân bằng tuyệt vời nhất. Bạn vừa biết yêu thương nồng nàn vừa giữ được sự tỉnh táo và thực tế. Biết cách chăm sóc bản thân lẫn đối phương.',
            advice: 'Đây là đường tình cảm hài hòa, dễ xây dựng mái ấm gia đình hạnh phúc bền lâu.'
          },
          straight_short: {
            id: 'straight_short',
            label: 'Thẳng và kết thúc dưới ngón giữa (Gò Thổ Tinh)',
            reading: 'Người kín đáo, ít bộc lộ cảm xúc ra ngoài. Trong tình yêu, bạn dùng lý trí nhiều hơn con tim, thực tế và coi trọng sự độc lập cá nhân.',
            advice: 'Hãy học cách chia sẻ những tâm tư bên trong với người tri kỷ, tình cảm sẽ ngày càng mặn nồng.'
          },
          chained_branches: {
            id: 'chained_branches',
            label: 'Có nhiều nhánh nhỏ rủ xuống hoặc hình mắt xích',
            reading: 'Trái tim đa cảm, dễ rung động và giàu lòng đồng cảm. Bạn dễ bị cảm xúc của người xung quanh tác động, từng trải qua những thăng trầm buồn vui trong tình duyên.',
            advice: 'Học cách yêu lấy chính mình trước tiên. Khi bạn độc lập và tự tin, bạn sẽ thu hút người đồng điệu.'
          },
          forked_trident: {
            id: 'forked_trident',
            label: 'Phân làm ba nhánh như chiếc đinh ba ở điểm cuối',
            reading: 'Được mệnh danh là "Ngã ba may mắn" trong tình cảm. Bạn có sức hút đặc biệt, vừa thông minh, nhân hậu lại có duyên ngầm trong các mối quan hệ xã hội.',
            advice: 'Bạn có duyên kết nối nhân tâm, hãy dùng tình cảm ấm áp để lan tỏa năng lượng tích cực cho tập thể.'
          }
        }
      },

      fate: {
        id: 'fate',
        name: 'Đường Định Mệnh (Sự Nghiệp)',
        han: '命運線',
        significance: 'Thể hiện chí hướng công danh, mức độ tập trung vào sự nghiệp, thời điểm định hình con đường đời và sự trợ lực từ ngoại cảnh hay quý nhân.',
        options: {
          clear_from_base: {
            id: 'clear_from_base',
            label: 'Rõ nét, chạy thẳng từ đáy cổ tay lên ngón giữa',
            reading: 'Ý thức tự lập từ sớm, mục tiêu cuộc đời rõ ràng và kiên định. Bạn sớm tìm ra đam mê và từng bước vững chắc leo lên nấc thang thành công.',
            advice: 'Sự nghiệp thăng tiến vững chắc. Giữ vững tính kiên trì và khiêm tốn sẽ giúp bạn đi rất xa.'
          },
          starts_life_line: {
            id: 'starts_life_line',
            label: 'Bắt đầu dính liền từ đường Sinh Đạo đi lên',
            reading: 'Thành tựu hoàn toàn do bản thân tự thân vận động, đổ mồ hôi sôi nước mắt mà thành. Bạn không ỷ lại vào gia thế mà tự mình kiến tạo vận mệnh.',
            advice: 'Mỗi giọt mồ hôi đều xứng đáng. Bạn là người truyền cảm hứng mạnh mẽ về ý chí vượt khó.'
          },
          starts_moon: {
            id: 'starts_moon',
            label: 'Bắt đầu từ gò Thái Âm (cạnh ngoài bàn tay) đi lên',
            reading: 'Sự nghiệp gắn liền với sự yêu mến của công chúng, khách hàng hoặc sự nâng đỡ của quý nhân phương xa. Rất có duyên với nghệ thuật, kinh doanh, dịch vụ.',
            advice: 'Hãy mở rộng mạng lưới giao tiếp, sự chân thành sẽ đem đến cho bạn vô số cơ hội hợp tác quý giá.'
          },
          broken_overlapping: {
            id: 'broken_overlapping',
            label: 'Đứt đoạn rồi nối tiếp, hoặc đổi hướng giữa chừng',
            reading: 'Sự nghiệp có sự chuyển hướng rõ rệt ở độ tuổi 30–40. Bạn có thể thay đổi ngành nghề hoàn toàn và phát triển rực rỡ hơn ở con đường mới.',
            advice: 'Đừng sợ việc chuyển hướng công việc. Mọi kinh nghiệm tích lũy trước đó sẽ là đòn bẩy cho bước nhảy mới.'
          },
          absent_faint: {
            id: 'absent_faint',
            label: 'Không có hoặc rất mờ nhạt',
            reading: 'Tâm hồn tự do, không thích bị gò bó vào một con đường cố định. Bạn linh hoạt, sống theo cảm hứng và không đặt nặng áp lực danh vị xã hội.',
            advice: 'Hãy tận hưởng cuộc sống tự do, nhưng nên xây dựng một quỹ tích lũy tài chính để đảm bảo an tâm lâu dài.'
          }
        }
      },

      sun: {
        id: 'sun',
        name: 'Đường Thái Dương (Tài Danh & Hào Quang)',
        han: '太陽線',
        significance: 'Bổ trợ cho đường Định Mệnh, báo hiệu danh tiếng, năng khiếu thẩm mỹ, sự công nhận của xã hội và tài lộc dồi dào.',
        options: {
          clear_long: {
            id: 'clear_long',
            label: 'Rõ nét chạy dài dưới ngón áp út',
            reading: 'Dấu hiệu của người có tài năng nổi bật và sớm muộn cũng được công chúng đón nhận. Tài lộc sung túc, có uy tín và sức hút cá nhân lớn.',
            advice: 'Tận dụng danh tiếng để làm việc có ích cho cộng đồng, tài lộc sẽ càng sinh sôi nảy nở.'
          },
          short_upper: {
            id: 'short_upper',
            label: 'Ngắn, chỉ xuất hiện ở nửa trên gần ngón tay',
            reading: 'Hậu vận rực rỡ, thành công và danh tiếng chín muồi ở tuổi trung niên trở đi sau khi đã tích lũy đủ kinh nghiệm.',
            advice: 'Kiên trì gieo hạt, quả ngọt sẽ tới đúng thời điểm bạn đã sẵn sàng đón nhận.'
          },
          none: {
            id: 'none',
            label: 'Không có hoặc chưa rõ ràng',
            reading: 'Bạn là người làm việc âm thầm, không quá khát khao hào quang nổi tiếng mà chú trọng vào kết quả thực chất và sự bình an nội tâm.',
            advice: 'Sự bình dị chính là hạnh phúc. Hãy giữ cho tâm trí luôn an nhiên, tự tại.'
          }
        }
      }
    },

    // Các Dấu Ấn Đặc Biệt & Quý Tướng
    specialSigns: {
      letter_m: {
        id: 'letter_m',
        name: 'Chữ M Thần Tài (Bốn Đường Hòa Quyện)',
        han: 'M字紋',
        description: 'Tạo bởi sự giao thoa hài hòa giữa 4 đường: Sinh Đạo, Trí Đạo, Định Mệnh và Tâm Đạo tạo thành chữ M rõ nét trên lòng bàn tay.',
        reading: 'Biểu trưng của sự hòa hợp giữa Thể xác (Sinh), Trí tuệ (Trí), Chí hướng (Định mệnh) và Con tim (Tâm). Người có chữ M thường có trực giác kinh doanh cực nhạy, nắm bắt cơ hội tài chính chuẩn xác và có tố chất lãnh đạo bẩm sinh.',
        advice: 'Hãy giữ tâm trong sáng và làm ăn chân chính. Chữ M khi đi cùng lòng chính trực sẽ mang lại tài lộc bền vững qua nhiều thế hệ.'
      },
      mystic_cross: {
        id: 'mystic_cross',
        name: 'Chữ X Thần Bí (Mystic Cross)',
        han: '神秘十字紋',
        description: 'Dấu chữ thập nằm độc lập ở khoảng trống giữa đường Trí Đạo và đường Tâm Đạo.',
        reading: 'Dấu ấn của "con mắt thứ sáu" và linh cảm phi thường. Bạn có trực giác tâm linh mạnh mẽ, khả năng thấu thị tâm lý người khác và thường được các lực vô hình che chở trong nghịch cảnh.',
        advice: 'Nên tìm hiểu về triết học, tâm lý học hoặc thiền định để nuôi dưỡng và điều hướng nguồn năng lượng trực giác này.'
      },
      solomon_ring: {
        id: 'solomon_ring',
        name: 'Vòng Solomon (Vòng Trí Tuệ Vua)',
        han: '木星環',
        description: 'Đường cong bán nguyệt bao quanh gốc ngón tay trỏ (Gò Mộc Tinh).',
        reading: 'Tượng trưng cho sự khôn ngoan của bậc quân vương, năng lực thấu hiểu tâm lý nhân loại và khả năng giảng dạy, dẫn dắt người khác.',
        advice: 'Bạn có sứ mệnh chia sẻ tri thức và dẫn đường cho những ai đang bế tắc.'
      },
      buddha_eye: {
        id: 'buddha_eye',
        name: 'Vân Mắt Phật (Phật Nhãn)',
        han: '佛眼紋',
        description: 'Đường vân ở khớp đốt thứ nhất của ngón tay cái tạo thành hình con mắt khép kín.',
        reading: 'Biểu trưng của trí tuệ bẩm sinh, trí nhớ tuyệt vời và giác quan thứ sáu nhạy bén. Người có mắt Phật thường có tâm hồn lương thiện, gặp dữ hóa lành.',
        advice: 'Giữ lòng từ bi và bao dung, phúc đức của bạn sẽ là tấm lá chắn che chở cho cả gia đình.'
      }
    },

    // Hệ thống 7 Gò Bàn Tay (The 7 Planetary Mounts)
    mounts: {
      jupiter: {
        id: 'jupiter',
        name: 'Gò Mộc Tinh (Jupiter)',
        han: '木星丘',
        symbol: '♃',
        location: 'Dưới gốc ngón tay trỏ',
        domain: 'Quyền uy, lãnh đạo & hoài bão',
        color: '#E7C98A',
        prominent: 'Đầy đặn, hồng hào biểu hiện năng lực lãnh đạo bẩm sinh, ý chí tiến thủ mạnh mẽ, có lòng tự trọng và được tập thể tín nhiệm.',
        flat: 'Bằng phẳng thể hiện tính cách khiêm nhường, không màng tranh đoạt quyền vị, yêu thích sự tự do và bình yên.',
        advice: 'Hãy đặt mục tiêu rõ ràng và dùng uy tín chân thành để truyền cảm hứng cho người xung quanh.'
      },
      saturn: {
        id: 'saturn',
        name: 'Gò Thổ Tinh (Saturn)',
        han: '土星丘',
        symbol: '♄',
        location: 'Dưới gốc ngón tay giữa',
        domain: 'Kỷ luật, trách nhiệm & triết lý sống',
        color: '#B7A7FF',
        prominent: 'Nhô cao vừa phải phản ánh tư duy thâm trầm, cẩn trọng, kiên nhẫn vượt khó và có năng khiếu đào sâu vào chuyên môn phức tạp.',
        flat: 'Hơi trũng cho thấy tâm hồn cởi mở, không thích các quy tắc rập khuôn, linh hoạt đón nhận cái mới.',
        advice: 'Kiên trì chính là chìa khóa mở mọi cánh cửa. Hãy giữ tâm tĩnh lặng trước mọi thăng trầm.'
      },
      sun: {
        id: 'sun',
        name: 'Gò Thái Dương (Apollo)',
        han: '太陽丘',
        symbol: '☉',
        location: 'Dưới gốc ngón tay áp út (ngón nhẫn)',
        domain: 'Hào quang, nghệ thuật & tài lộc',
        color: '#F6E8C6',
        prominent: 'Đầy đặn, sáng rõ là nét tướng của người có khiếu thẩm mỹ, sự duyên dáng, dễ gặt hái thành công và có vận may tài lộc lớn.',
        flat: 'Bình thường thể hiện lối sống giản dị, chú trọng giá trị thực chất bên trong hơn sự tán dương bề ngoài.',
        advice: 'Tự tin chia sẻ các ý tưởng sáng tạo của bản thân, hào quang danh vọng sẽ tự khắc lan tỏa.'
      },
      mercury: {
        id: 'mercury',
        name: 'Gò Thủy Tinh (Mercury)',
        han: '水星丘',
        symbol: '☿',
        location: 'Dưới gốc ngón tay út',
        domain: 'Giao tiếp, tài thương mại & ứng biến',
        color: '#9FD8B4',
        prominent: 'Nở nang, thanh tú là biểu trưng của đầu óc kinh doanh nhạy bén, tài ăn nói hoạt bát, quan hệ ngoại giao rộng mở và thích ứng nhanh.',
        flat: 'Phẳng cho thấy tính cách bộc trực, chân thành, không khéo léo trong tính toán được mất.',
        advice: 'Phát huy thế mạnh kết nối nhân tâm và tư duy chiến lược trong thương trường hoặc nghiên cứu.'
      },
      venus: {
        id: 'venus',
        name: 'Gò Kim Tinh (Venus)',
        han: '金星丘',
        symbol: '♀',
        location: 'Vùng thịt gốc ngón tay cái',
        domain: 'Sinh lực thể chất, tình cảm & lòng từ ái',
        color: '#F5C4D8',
        prominent: 'Căng tròn, hồng hào thể hiện thể lực dồi dào, khả năng phục hồi tốt, sống nhiệt thành, giàu tình cảm và rất yêu cái đẹp.',
        flat: 'Mỏng nhẹ cho thấy năng lượng cơ thể thanh mảnh, tính cách điềm đạm, thích sự tĩnh lặng và kiểm soát cảm xúc tốt.',
        advice: 'Nuôi dưỡng lối sống lành mạnh; tình yêu thương ấm áp chính là nguồn năng lượng chữa lành mạnh mẽ nhất.'
      },
      moon: {
        id: 'moon',
        name: 'Gò Thái Âm (Luna)',
        han: '太陰丘',
        symbol: '☽',
        location: 'Cạnh ngoài đối diện gò Kim Tinh',
        domain: 'Trực giác tâm linh, trí tưởng tượng & tiềm thức',
        color: '#C4B5FD',
        prominent: 'Rộng rãi, đầy đặn báo hiệu trực giác tâm linh siêu nhạy, óc tưởng tượng phong phú, có duyên với nghệ thuật hoặc du hành xa.',
        flat: 'Bằng phẳng thể hiện tư duy cực kỳ thực tế, chỉ tin vào những gì đã được chứng thực bằng số liệu và logic.',
        advice: 'Hãy trân trọng và lắng nghe tiếng nói trực giác nội tâm, nó sẽ mách bảo những khúc quanh định mệnh.'
      },
      mars: {
        id: 'mars',
        name: 'Gò Hỏa Tinh & Bình Nguyên (Mars)',
        han: '火星丘',
        symbol: '♂',
        location: 'Trung tâm lòng bàn tay & hai bên sườn',
        domain: 'Dũng khí, ý chí kiên định & kiểm soát cảm xúc',
        color: '#F87171',
        prominent: 'Săn chắc, ấm áp biểu thị tinh thần quả cảm, kiên cường không lùi bước trước thử thách, giữ được bình tĩnh trong nghịch cảnh.',
        flat: 'Hơi trũng là người ôn hòa, yêu chuộng hòa khí, tránh va chạm và giàu lòng nhẫn nại.',
        advice: 'Biết cương nhu đúng lúc, biến lòng dũng cảm thành hành động có chiến lược.'
      }
    },

    // Triết lý cốt lõi
    philosophy: {
      title: 'Tướng Tùy Tâm Sinh · Tướng Tùy Tâm Diệt',
      quote: 'Hữu tâm vô tướng, tướng tự tâm sinh. Hữu tướng vô tâm, tướng tùy tâm diệt.',
      explanation: 'Chỉ tay không phải là số phận đóng khung bất di bất dịch, mà là tấm bản đồ ghi lại thói quen suy nghĩ, hành vi và lối sống của bạn. Các nhà nghiên cứu thần kinh học hiện đại đã chứng minh bàn tay nối liền với hàng ngàn đầu dây thần kinh não bộ. Khi bạn thay đổi tư duy, lối sống và tu dưỡng tâm đức, các đường chỉ tay sẽ tự động dịch chuyển và biến đổi tích cực sau mỗi 3 đến 7 năm.'
    }
  };

  window.PALMISTRY = PALMISTRY;
})();
