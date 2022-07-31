import recommendationService from "../../src/services/recommendationsService";
import recommendationRepository from "../../src/repositories/recommendationRepository";
import { jest } from "@jest/globals";
import { Recommendation } from ".prisma/client";
import { conflictError } from "../../src/utils/errorUtils.js";
import { notFoundError } from "../../src/utils/errorUtils";

const recommendation = {
  id: 1,
  name: "Test",
  score: 5,
  youtubeLink: "http://www.youtube.com",
};

describe("creation", () => {
  it("should insert a recommendation", async () => {
    jest
      .spyOn(recommendationRepository, "findByName")
      .mockResolvedValueOnce(null);
    jest.spyOn(recommendationRepository, "create").mockResolvedValueOnce(null);

    await recommendationService.insert({
      name: "Test",
      youtubeLink: "http://www.youtube.com",
    });

    expect(recommendationRepository.create).toBeCalled();
  });

  it("should not insert a duplicated recommendation", async () => {
    jest
      .spyOn(recommendationRepository, "findByName")
      .mockResolvedValueOnce(recommendation);

    expect(
      recommendationService.insert({
        name: recommendation.name,
        youtubeLink: recommendation.youtubeLink,
      })
    ).rejects.toEqual(conflictError("Recommendations names must be unique"));
  });
});

describe("upvote", () => {
  it("should upvote a recommendation", async () => {
    jest
      .spyOn(recommendationRepository, "find")
      .mockResolvedValueOnce(recommendation);
    jest
      .spyOn(recommendationRepository, "updateScore")
      .mockResolvedValueOnce(null);
    await recommendationService.upvote(recommendation.id);

    expect(recommendationRepository.updateScore).toBeCalled();
  });

  it("should not upvote a recommendation that doesnt exist", async () => {
    jest.spyOn(recommendationRepository, "find").mockResolvedValueOnce(null);

    expect(recommendationService.upvote(recommendation.id)).rejects.toEqual(
      notFoundError()
    );
  });
});

describe("downvote", () => {
  it("should remove a recommendation after score  < -5", async () => {
    jest
      .spyOn(recommendationRepository, "find")
      .mockResolvedValueOnce({ ...recommendation });
    jest
      .spyOn(recommendationRepository, "updateScore")
      .mockResolvedValueOnce({ score: -6 } as any);
    jest
      .spyOn(recommendationRepository, "remove")
      .mockImplementationOnce((): any => {});

    await recommendationService.downvote(1);

    expect(recommendationRepository.remove).toBeCalledTimes(1);
  });

  it("should not remove a recommendation after downvote of score > -5", async () => {
    // TODO: nesta função, o teste não passa por que ele não reconhece o mock que está neste teste, e sim o mock da função "updateScore" do teste anterior a este, não sei por que, mas o jest não está lidando de forma assincrona neste caso específico 
    jest
      .spyOn(recommendationRepository, "find")
      .mockResolvedValueOnce({ ...recommendation });
    jest
      .spyOn(recommendationRepository, "updateScore")
      .mockResolvedValueOnce({ score: 5 } as any);
    jest
      .spyOn(recommendationRepository, "remove")
      .mockImplementationOnce((): any => {});

    await recommendationService.downvote(1);

    expect(recommendationRepository.remove).toBeCalledTimes(0);
  });
});

describe("get", () => {
  it("should get all recommendations", async () => {
    jest.spyOn(recommendationRepository, "findAll").mockResolvedValueOnce(null);

    await recommendationService.get();

    expect(recommendationRepository.findAll).toBeCalled();
  });

  it("should get all recommendations by amount", async () => {
    jest
      .spyOn(recommendationRepository, "getAmountByScore")
      .mockResolvedValueOnce(null);

    await recommendationService.getTop(1);

    expect(recommendationRepository.getAmountByScore).toBeCalled();
  });

  it("should get random recommendation lte", async () => {
    const fixedAbove70 = 0.9;
    jest
      .spyOn(recommendationRepository, "findAll")
      .mockResolvedValueOnce([recommendation]);
    jest.spyOn(Math, "random").mockReturnValueOnce(fixedAbove70);

    expect(await recommendationService.getRandom()).toEqual(recommendation);
    expect(recommendationRepository.findAll).toBeCalledWith({
      score: 10,
      scoreFilter: "lte",
    });
  });

  it("should get random recommendation gt", async () => {
    const fixedBelow70 = 0.4;
    jest
      .spyOn(recommendationRepository, "findAll")
      .mockResolvedValueOnce([recommendation]);
    jest.spyOn(Math, "random").mockReturnValueOnce(fixedBelow70);

    expect(await recommendationService.getRandom()).toEqual(recommendation);
    expect(recommendationRepository.findAll).toBeCalledWith({
      score: 10,
      scoreFilter: "gt",
    });
  });

  it("should not get random recommendation", async () => {
    jest.spyOn(recommendationRepository, "findAll").mockResolvedValue([]);
    expect(recommendationService.getRandom()).rejects.toEqual({
      type: "not_found",
      message: "",
    });
  });
});
