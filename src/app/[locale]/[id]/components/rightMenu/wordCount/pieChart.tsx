import { toast } from "sonner";
import { useAtom } from "jotai";
import { Pie, PieChart } from "recharts"
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useTool } from "@/hooks/global/use-tool";
import { getList } from "@/components/bookCard/indexDB";
import { Card, CardContent, } from "@/components/ui/card";
import { catalogueConfigAtom, userConfigAtom } from "@/stores";
import { getAllChaptersList } from "../../leftMenu/catalogue/indexDB";
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface IChartData {
  id: number,
  browser: string,
  visitors: number,
  fill: string
}
export function PieChartCom() {
  const t = useTranslations();
  const { countWords } = useTool()

  const [{ moreSettingData }] = useAtom(userConfigAtom);
  const [{ chapterData }] = useAtom(catalogueConfigAtom);

  const [chartData, setChartData] = useState<IChartData[]>([]);
  const [chartConfig, setChartConfig] = useState<ChartConfig>({});
  const [colorCache, setColorCache] = useState<Record<string, string>>({})
  const [allZero, setAllZero] = useState(false);

  const getRandomRGB = (usedColors: string[]) => {
    let color;
    do {
      const r = Math.floor(Math.random() * 256);
      const g = Math.floor(Math.random() * 256);
      const b = Math.floor(Math.random() * 256);
      color = `rgb(${r}, ${g}, ${b})`;
    } while (usedColors.includes(color));
    return color;
  }

  useEffect(() => {
    onHandleChartData();
  }, [chapterData])

  const onHandleChartData = async () => {
    try {
      const chaptersList = await getAllChaptersList();
      const novelList = await getList();
      const tempChartData: IChartData[] = [];
      const chartConfig: ChartConfig = {};
      for (let i = 0; i < novelList.length; i++) {
        const item = novelList[i];
        let color = colorCache[item.name];

        if (!color) {
          const usedColors = Object.values(colorCache);
          color = getRandomRGB(usedColors);
          setColorCache((v) => ({ ...v, [item.name]: color }))
        }

        let text = '';
        const tempChapters = chaptersList.filter(f => f.parentId === item.id);
        if (tempChapters) {
          tempChapters.forEach(f => text += f.content);
          const visitors = countWords(text, moreSettingData?.ignorePunctuation)
          tempChartData.push({ visitors, browser: item.name, id: item.id!, fill: color });
          chartConfig[item.name] = {
            label: item.name,
            color
          }
        } else {
          tempChartData.push({ visitors: 0, browser: item.name, id: item.id!, fill: color });
          chartConfig[item.name] = {
            label: item.name,
            color
          }
        }

      }
      setChartData(tempChartData)
      setChartConfig({
        visitors: {
          label: "Visitors",
        },
        ...chartConfig,
      })
      setAllZero(tempChartData.every(item => item.visitors === 0));
    } catch (error) {
      toast.error(t('wordCount.pieChart_error'))
    }
  }

  return (
    <Card className="flex flex-col border-none shadow-none p-0 bg-transparent">
      <CardContent className="flex-1 pb-0">
        {allZero ?
          <div className="flex items-center justify-center h-[200px] w-[200px] mx-auto  border rounded-full">
            <p>{t('wordCount.noData')}</p>
          </div> :
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[300px]"
          >
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <Pie data={chartData} dataKey="visitors" nameKey="browser" />
              <ChartLegend
                content={<ChartLegendContent nameKey="browser" />}
                className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
              />
            </PieChart>
          </ChartContainer>
        }
      </CardContent>
    </Card>
  )
}
